import asyncio
import time
import logging
import uuid
from typing import Dict, Any, List, Optional
from .config import CONCURRENCY_LIMIT
from .harness import make_context, render_attack
from .attacks import get_attacks_for_run
from .attacker_llm import generate_app_attacks
from .judge import judge
from .scoring import calculate_scores
from .hardener import generate_hardened_prompt, check_benign_tasks
from .llm import chat, RateLimitError
from .storage import save_run, save_attack_record, save_run_completion, update_run_status

logger = logging.getLogger(__name__)

# Active runs storage: run_id -> dict(queue=asyncio.Queue, task=asyncio.Task, cancelled=bool)
ACTIVE_RUNS: Dict[str, Dict[str, Any]] = {}

class TestRunner:
    __test__ = False
    def __init__(self, run_id: str, request_data: Dict[str, Any]):
        self.run_id = run_id
        self.user_prompt = request_data.get("prompt", "")
        self.model = request_data.get("model", "llama3.2:latest")
        self.provider = request_data.get("provider", "ollama")
        self.api_key = request_data.get("api_key")
        self.deep_scan = request_data.get("deep_scan", False)
        self.scan_scope = request_data.get("scan_scope", "quick")
        self.generate_app_attacks = request_data.get("generate_app_attacks", True)
        self.auto_harden = request_data.get("auto_harden", True)
        self.custom_attacks = request_data.get("custom_attacks")
        
        self.queue: asyncio.Queue = asyncio.Queue()
        # On local CPU inference (Ollama), sequential processing is 3x faster than parallel CPU contention
        sem_limit = 1 if (self.provider or "").lower() == "ollama" else CONCURRENCY_LIMIT
        self.semaphore = asyncio.Semaphore(sem_limit)
        self.is_cancelled = False
        self.initial_results: List[Dict[str, Any]] = []

    async def emit(self, event_type: str, data: Dict[str, Any]):
        """Pushes an SSE event into the queue."""
        event_payload = {
            "event": event_type,
            "data": data,
            "timestamp": time.time(),
        }
        await self.queue.put(event_payload)

    async def execute(self):
        try:
            save_run(self.run_id, self.user_prompt, self.model, self.provider)

            # 1. Prepare Test Harness (Canary + Marker)
            ctx = make_context(self.user_prompt)

            # 2. Gather Attacks (Base + Mutators + Custom)
            all_attacks = get_attacks_for_run(
                scan_scope=self.scan_scope,
                deep_scan=self.deep_scan,
                custom_attacks=self.custom_attacks,
            )

            # Emit run_started immediately so the UI activates with zero delay
            await self.emit("run_started", {
                "run_id": self.run_id,
                "total_attacks": len(all_attacks) + (4 if self.generate_app_attacks else 0),
                "model": self.model,
                "provider": self.provider,
                "canary_prefix": ctx["canary"][:8] + "...",
                "marker": ctx["marker"],
                "deep_scan": self.deep_scan,
            })

            # 3. Add AI Generated App-Specific Attacks if requested
            if self.generate_app_attacks:
                await self.emit("stage_update", {
                    "stage": "generating_attacks",
                    "message": "Synthesizing domain-tailored injection vectors..."
                })
                app_attacks = await generate_app_attacks(
                    user_prompt=self.user_prompt,
                    model=self.model,
                    provider=self.provider,
                    api_key=self.api_key
                )
                all_attacks.extend(app_attacks)

            total_count = len(all_attacks)

            # 4. Concurrently run base attacks against harnessed system prompt
            await self.emit("stage_update", {
                "stage": "running_attacks",
                "message": f"Executing {total_count} attack vectors against target prompt..."
            })

            async def run_single_attack(attack: Dict[str, Any]):
                if self.is_cancelled:
                    return None

                rendered = render_attack(attack["template"], ctx)
                start_t = time.perf_counter()
                
                async with self.semaphore:
                    for attempt in range(3):
                        if self.is_cancelled:
                            return None
                        try:
                            response = await chat(
                                system=ctx["system"],
                                user=rendered,
                                model=self.model,
                                provider=self.provider,
                                api_key=self.api_key,
                                temperature=0.0,
                            )
                            break
                        except RateLimitError:
                            if attempt == 2:
                                response = "[Error: Rate limit exceeded]"
                                break
                            await asyncio.sleep(2 ** attempt)
                        except Exception as e:
                            logger.error(f"Error evaluating attack {attack['id']}: {e}")
                            response = f"[Error: {str(e)}]"

                duration_ms = round((time.perf_counter() - start_t) * 1000, 2)
                judgement = judge(attack, response, ctx)

                attack_result = {
                    "id": attack["id"],
                    "name": attack["name"],
                    "category": attack["category"],
                    "severity": attack["severity"],
                    "goal": attack["goal"],
                    "rendered_input": rendered,
                    "response": response[:500],
                    "verdict": judgement["verdict"],
                    "reason": judgement["reason"],
                    "is_mutation": attack.get("is_mutation", False),
                    "is_generated": attack.get("is_generated", False),
                    "duration_ms": duration_ms,
                    "canary_found": judgement["canary_found"],
                    "marker_found": judgement["marker_found"],
                }

                self.initial_results.append(attack_result)
                save_attack_record(self.run_id, attack_result, is_rerun=False)

                # Emit individual result
                await self.emit("attack_result", attack_result)

                # Emit running score update
                current_score = calculate_scores(self.initial_results)
                await self.emit("score_update", current_score.model_dump())
                return attack_result

            # Run in worker tasks
            tasks = [run_single_attack(a) for a in all_attacks]
            await asyncio.gather(*tasks)

            if self.is_cancelled:
                update_run_status(self.run_id, "cancelled")
                await self.emit("cancelled", {"message": "Run was stopped by user."})
                return

            # Compute final initial score
            initial_score = calculate_scores(self.initial_results)
            failures = [r for r in self.initial_results if r["verdict"] == "fail"]
            flips_count = 0
            hardened_prompt = None
            hardened_resistance = initial_score.overall_resistance
            changes = []
            benign_results = []

            # 5. Hardening and Regression Testing (if auto_harden is enabled)
            if self.auto_harden and len(failures) > 0:
                await self.emit("stage_update", {
                    "stage": "hardening",
                    "message": f"Hardening prompt based on {len(failures)} detected vulnerabilities..."
                })

                hardening_data = await generate_hardened_prompt(
                    user_prompt=self.user_prompt,
                    failures=failures,
                    model=self.model,
                    provider=self.provider,
                    api_key=self.api_key,
                )
                hardened_prompt = hardening_data["hardened_prompt"]
                changes = hardening_data["changes"]

                await self.emit("hardened_prompt", {
                    "original_prompt": self.user_prompt,
                    "hardened_prompt": hardened_prompt,
                    "changes": changes,
                })

                # Re-test failed attacks against the hardened prompt
                await self.emit("stage_update", {
                    "stage": "rerunning",
                    "message": f"Re-testing {len(failures)} vulnerable vectors against hardened prompt..."
                })

                hardened_ctx = make_context(hardened_prompt)
                rerun_results = []

                for failed_att in failures:
                    if self.is_cancelled:
                        break
                    
                    rendered = render_attack(failed_att["rendered_input"], hardened_ctx)
                    try:
                        resp = await chat(
                            system=hardened_ctx["system"],
                            user=rendered,
                            model=self.model,
                            provider=self.provider,
                            api_key=self.api_key,
                            temperature=0.0
                        )
                    except Exception as e:
                        resp = f"[Error: {str(e)}]"

                    new_judgement = judge(failed_att, resp, hardened_ctx)
                    flipped = (failed_att["verdict"] == "fail" and new_judgement["verdict"] == "pass")
                    if flipped:
                        flips_count += 1

                    rerun_item = {
                        "id": failed_att["id"],
                        "name": failed_att["name"],
                        "category": failed_att["category"],
                        "previous_verdict": failed_att["verdict"],
                        "new_verdict": new_judgement["verdict"],
                        "flipped": flipped,
                        "new_reason": new_judgement["reason"],
                        "new_response": resp[:400],
                    }
                    rerun_results.append(rerun_item)
                    save_attack_record(self.run_id, rerun_item, is_rerun=True)
                    await self.emit("rerun_result", rerun_item)

                # Calculate updated score after hardening
                # Create merged virtual results replacing failed items with their rerun verdicts
                merged_results = []
                rerun_map = {r["id"]: r["new_verdict"] for r in rerun_results}
                for item in self.initial_results:
                    item_copy = dict(item)
                    if item["id"] in rerun_map:
                        item_copy["verdict"] = rerun_map[item["id"]]
                    merged_results.append(item_copy)

                post_score = calculate_scores(merged_results)
                hardened_resistance = post_score.overall_resistance

                await self.emit("score_comparison", {
                    "before_resistance": initial_score.overall_resistance,
                    "after_resistance": hardened_resistance,
                    "flips_count": flips_count,
                    "total_failures": len(failures),
                })

                # 6. Benign tasks check (Over-refusal false-positive test)
                max_b_tasks = 2 if (self.provider or "").lower() == "ollama" else 5
                await self.emit("stage_update", {
                    "stage": "benign_check",
                    "message": f"Running {max_b_tasks} benign tasks to verify bot still answers legitimate queries..."
                })

                benign_results = await check_benign_tasks(
                    original_prompt=self.user_prompt,
                    hardened_prompt=hardened_prompt,
                    model=self.model,
                    provider=self.provider,
                    api_key=self.api_key,
                    max_tasks=max_b_tasks,
                )

                for b in benign_results:
                    await self.emit("benign_check_result", b)

            # 7. Complete run
            summary_data = {
                "run_id": self.run_id,
                "initial_score": initial_score.model_dump(),
                "final_resistance": hardened_resistance,
                "improvement": round(hardened_resistance - initial_score.overall_resistance, 1),
                "flips_count": flips_count,
                "total_attacks": total_count,
                "benign_checks_passed": sum(1 for b in benign_results if b["hardened_passed"]),
            }

            save_run_completion(
                run_id=self.run_id,
                initial_resistance=initial_score.overall_resistance,
                hardened_prompt=hardened_prompt,
                hardened_resistance=hardened_resistance,
                flips_count=flips_count,
                changes=changes,
                benign_checks=benign_results,
                summary_data=summary_data,
            )

            await self.emit("done", summary_data)

        except asyncio.CancelledError:
            logger.info(f"Run {self.run_id} cancelled.")
            update_run_status(self.run_id, "cancelled")
            await self.emit("cancelled", {"message": "Run cancelled."})
        except Exception as e:
            logger.exception(f"Fatal error during run {self.run_id}: {e}")
            update_run_status(self.run_id, "error")
            await self.emit("error", {"message": str(e)})
        finally:
            # End stream sentinel
            await self.queue.put(None)

    def cancel(self):
        self.is_cancelled = True

def start_run(request_data: Dict[str, Any]) -> str:
    run_id = f"run-{uuid.uuid4().hex[:8]}"
    runner = TestRunner(run_id, request_data)
    task = asyncio.create_task(runner.execute())
    ACTIVE_RUNS[run_id] = {
        "runner": runner,
        "task": task,
        "queue": runner.queue,
    }
    return run_id

def stop_run(run_id: str) -> bool:
    if run_id in ACTIVE_RUNS:
        runner_entry = ACTIVE_RUNS[run_id]
        runner_entry["runner"].cancel()
        runner_entry["task"].cancel()
        return True
    return False

def get_run_queue(run_id: str) -> Optional[asyncio.Queue]:
    if run_id in ACTIVE_RUNS:
        return ACTIVE_RUNS[run_id]["queue"]
    return None
