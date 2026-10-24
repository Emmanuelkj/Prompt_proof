import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import httpx

from .models import CreateRunRequest, CustomAttackRequest
from .config import OLLAMA_HOST
from .runner import start_run, stop_run, get_run_queue
from .storage import init_db, get_run, list_runs
from .harness import make_context, render_attack
from .judge import judge
from .llm import chat

app = FastAPI(
    title="PromptProof API",
    description="Deterministic Prompt Injection Tester, Hardener, and Regression Suite",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "PromptProof", "version": "1.0.0"}

@app.get("/api/models")
async def get_models():
    """Returns detected local Ollama models and cloud model providers."""
    ollama_models = []
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{OLLAMA_HOST.rstrip('/')}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                ollama_models = [m["name"] for m in data.get("models", [])]
    except Exception:
        ollama_models = ["llama3.2:latest", "llama3:latest"]

    return {
        "providers": [
            {
                "id": "ollama",
                "name": "Ollama (Local / Zero Latency / 100% Free)",
                "models": ollama_models if ollama_models else ["llama3.2:latest"],
                "requires_key": False,
                "is_active": len(ollama_models) > 0,
            },
            {
                "id": "mock",
                "name": "Deterministic Simulator (Instant Offline Demo)",
                "models": ["simulation-engine-v1"],
                "requires_key": False,
                "is_active": True,
            },
            {
                "id": "groq",
                "name": "Groq Cloud (Fast Free Tier)",
                "models": ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
                "requires_key": True,
                "is_active": False,
            },
            {
                "id": "gemini",
                "name": "Google Gemini (Free Tier)",
                "models": ["gemini-1.5-flash", "gemini-2.0-flash-exp"],
                "requires_key": True,
                "is_active": False,
            },
            {
                "id": "openai",
                "name": "OpenAI Compatible",
                "models": ["gpt-4o-mini", "gpt-3.5-turbo"],
                "requires_key": True,
                "is_active": False,
            }
        ]
    }

@app.get("/api/samples")
def get_sample_prompts():
    sample_file = Path(__file__).resolve().parent.parent / "data" / "samples.json"
    if sample_file.exists():
        with open(sample_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.post("/api/runs")
async def create_run(req: CreateRunRequest):
    run_id = start_run(req.model_dump())
    return {"run_id": run_id, "status": "started"}

@app.get("/api/runs/{run_id}/events")
async def stream_run_events(run_id: str, request: Request):
    queue = get_run_queue(run_id)
    if not queue:
        # Check if run already completed in DB
        record = get_run(run_id)
        if not record:
            raise HTTPException(status_code=404, detail="Run not found")
        
        async def completed_generator():
            yield f"event: done\ndata: {json.dumps(record.get('summary', {}))}\n\n"
        return StreamingResponse(completed_generator(), media_type="text/event-stream")

    async def event_generator():
        while True:
            # Check client disconnection
            if await request.is_disconnected():
                break

            try:
                event = await asyncio.wait_for(queue.get(), timeout=20.0)
            except asyncio.TimeoutError:
                # Keepalive heartbeat
                yield ": keepalive\n\n"
                continue

            if event is None:
                # Sentinel reached
                break

            yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/api/runs/{run_id}/stop")
def stop_running_task(run_id: str):
    success = stop_run(run_id)
    if not success:
        raise HTTPException(status_code=404, detail="Active run not found or already completed")
    return {"status": "stopped", "run_id": run_id}

@app.get("/api/runs")
def get_runs_history():
    return list_runs(limit=30)

@app.get("/api/runs/{run_id}")
def get_run_details(run_id: str):
    run_data = get_run(run_id)
    if not run_data:
        raise HTTPException(status_code=404, detail="Run not found")
    return run_data

@app.get("/api/runs/{run_id}/report")
def export_run_report(run_id: str):
    run_data = get_run(run_id)
    if not run_data:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Generate clean downloadable JSON audit report
    report_content = {
        "report_type": "PromptProof Security Audit & Hardening Report",
        "generated_at": run_data.get("created_at"),
        "run_id": run_id,
        "target_model": run_data.get("model"),
        "initial_resistance_score": f"{run_data.get('initial_resistance')}%",
        "hardened_resistance_score": f"{run_data.get('hardened_resistance')}%",
        "vulnerability_mitigations_count": run_data.get("flips_count"),
        "original_system_prompt": run_data.get("user_prompt"),
        "hardened_system_prompt": run_data.get("hardened_prompt"),
        "applied_security_guardrails": run_data.get("changes"),
        "benign_over_refusal_checks": run_data.get("benign_checks"),
        "attack_verdicts": run_data.get("initial_attacks"),
        "re_test_verdicts": run_data.get("rerun_attacks"),
    }
    
    return Response(
        content=json.dumps(report_content, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=promptproof-report-{run_id}.json"}
    )

@app.post("/api/custom-attack")
async def execute_custom_attack(req: CustomAttackRequest):
    """
    'Judge's Turn': Real-time playground to execute any custom prompt injection attack
    against the target prompt and view live verdict and reasoning.
    """
    ctx = make_context(req.prompt)
    attack_data = {
        "id": "LIVE-INTERACTIVE",
        "name": "Live Interactive Attack",
        "category": "interactive",
        "severity": "high",
        "goal": req.goal or "follow_instruction",
        "template": req.attack_text,
    }

    rendered = render_attack(req.attack_text, ctx)
    try:
        resp = await chat(
            system=ctx["system"],
            user=rendered,
            model=req.model,
            provider=req.provider,
            api_key=req.api_key,
            temperature=0.0
        )
    except Exception as e:
        resp = f"[Execution Error: {str(e)}]"

    judgement = judge(attack_data, resp, ctx)
    return {
        "rendered_input": rendered,
        "response": resp,
        "verdict": judgement["verdict"],
        "reason": judgement["reason"],
        "canary_secret": ctx["canary"],
        "marker_token": ctx["marker"],
    }

# Serve static frontend files if production build exists
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static")
