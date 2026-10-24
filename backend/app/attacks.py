import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "attacks.json"

def load_base_attacks() -> List[Dict[str, Any]]:
    """Loads all base attacks from the JSON repository."""
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_attacks_for_run(
    deep_scan: bool = False,
    custom_attacks: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Returns the complete attack suite for a run:
    - Base attacks (~32)
    - Mutated attacks (if deep_scan is True)
    - Any user-provided custom attacks
    """
    attacks = load_base_attacks()

    if deep_scan:
        from .mutators import generate_mutations
        mutations = generate_mutations(attacks)
        attacks.extend(mutations)

    if custom_attacks:
        for idx, ca in enumerate(custom_attacks):
            custom_item = {
                "id": ca.get("id", f"CUSTOM-{idx+1:02d}"),
                "name": ca.get("name", f"Custom Attack #{idx+1}"),
                "category": ca.get("category", "direct_override"),
                "severity": ca.get("severity", "high"),
                "goal": ca.get("goal", "follow_instruction"),
                "template": ca.get("template", ca.get("text", "")),
                "is_mutation": False,
                "is_generated": False,
            }
            attacks.append(custom_item)

    return attacks
