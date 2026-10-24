from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AttackGoal(str, Enum):
    LEAK_CANARY = "leak_canary"
    LEAK_PROMPT = "leak_prompt"
    FOLLOW_INSTRUCTION = "follow_instruction"

class AttackCategory(str, Enum):
    DIRECT_OVERRIDE = "direct_override"
    PROMPT_EXTRACTION = "prompt_extraction"
    CANARY_EXTRACTION = "canary_extraction"
    JAILBREAK = "jailbreak"
    FORMAT_ABUSE = "format_abuse"
    INDIRECT_INJECTION = "indirect_injection"
    AUTHORITY_URGENCY = "authority_urgency"
    MULTI_STEP = "multi_step"
    GENERATED = "generated"

class AttackSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Verdict(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    AMBIGUOUS = "ambiguous"
    ERROR = "error"

class Attack(BaseModel):
    id: str
    name: str
    category: str
    severity: AttackSeverity
    goal: AttackGoal
    template: str
    is_mutation: bool = False
    is_generated: bool = False
    parent_id: Optional[str] = None
    mutation_type: Optional[str] = None

class JudgeResult(BaseModel):
    verdict: Verdict
    reason: str
    response_snippet: str = ""
    canary_found: bool = False
    marker_found: bool = False
    prompt_leak_ratio: float = 0.0

class AttackResult(BaseModel):
    id: str
    name: str
    category: str
    severity: AttackSeverity
    goal: AttackGoal
    rendered_input: str
    response: str
    verdict: Verdict
    reason: str
    is_mutation: bool = False
    is_generated: bool = False
    duration_ms: Optional[float] = None

class CategoryScore(BaseModel):
    category: str
    total: int
    passed: int
    failed: int
    ambiguous: int
    weighted_fails: float
    weighted_total: float
    resistance: float

class RunScore(BaseModel):
    overall_resistance: float
    total_attacks: int
    passed_count: int
    failed_count: int
    ambiguous_count: int
    error_count: int
    category_scores: Dict[str, CategoryScore]

class BenignCheckResult(BaseModel):
    task: str
    original_response: str
    hardened_response: str
    original_passed: bool
    hardened_passed: bool
    reason: str

class HardeningResult(BaseModel):
    original_prompt: str
    hardened_prompt: str
    changes: List[str]
    rerun_results: List[Dict[str, Any]]
    before_score: float
    after_score: float
    flips_count: int
    benign_checks: List[BenignCheckResult]

class CreateRunRequest(BaseModel):
    prompt: str = Field(..., min_length=5, description="The system prompt to evaluate")
    model: Optional[str] = "llama3.2:latest"
    provider: Optional[str] = "ollama"
    api_key: Optional[str] = None
    deep_scan: bool = False
    generate_app_attacks: bool = True
    auto_harden: bool = True
    custom_attacks: Optional[List[Dict[str, Any]]] = None

class CustomAttackRequest(BaseModel):
    prompt: str
    attack_text: str
    goal: Optional[str] = "follow_instruction"
    model: Optional[str] = "llama3.2:latest"
    provider: Optional[str] = "ollama"
    api_key: Optional[str] = None

class SamplePrompt(BaseModel):
    id: str
    name: str
    level: str
    description: str
    prompt: str
