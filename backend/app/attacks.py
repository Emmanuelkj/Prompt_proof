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
    scan_scope: str = "quick",
    deep_scan: bool = False,
    custom_attacks: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Returns the complete attack suite for a run:
    - quick: 8 representative attacks (1 per category) - blazing fast for local CPU model & live demos
    - standard: 16 attacks (2 per category)
    - full: all 32 base attacks
    - Mutated attacks (if deep_scan is True)
    - Any user-provided custom attacks
    """
    all_base = load_base_attacks()

    scope = (scan_scope or "quick").lower()
    if scope == "quick":
        # Group by category and take top 1 from each category
        seen_cats = set()
        attacks = []
        for a in all_base:
            cat = a.get("category")
            if cat not in seen_cats:
                seen_cats.add(cat)
                attacks.append(a)
    elif scope == "standard":
        cat_counts = {}
        attacks = []
        for a in all_base:
            cat = a.get("category")
            count = cat_counts.get(cat, 0)
            if count < 2:
                cat_counts[cat] = count + 1
                attacks.append(a)
    else:
        attacks = list(all_base)

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
