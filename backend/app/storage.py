import sqlite3
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from .config import DB_PATH

logger = logging.getLogger(__name__)

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite schema for run history."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL,
                model TEXT NOT NULL,
                provider TEXT NOT NULL,
                user_prompt TEXT NOT NULL,
                initial_resistance REAL DEFAULT 0.0,
                hardened_prompt TEXT,
                hardened_resistance REAL DEFAULT 0.0,
                flips_count INTEGER DEFAULT 0,
                changes_json TEXT,
                benign_checks_json TEXT,
                summary_json TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS run_attacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT NOT NULL,
                attack_id TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL,
                goal TEXT NOT NULL,
                is_hardened_rerun INTEGER DEFAULT 0,
                verdict TEXT NOT NULL,
                reason TEXT NOT NULL,
                rendered_input TEXT,
                response TEXT,
                duration_ms REAL,
                FOREIGN KEY (run_id) REFERENCES runs (run_id)
            )
        """)
        conn.commit()

def save_run(run_id: str, user_prompt: str, model: str, provider: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO runs 
            (run_id, created_at, status, model, provider, user_prompt)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            run_id,
            datetime.utcnow().isoformat(),
            "running",
            model,
            provider,
            user_prompt
        ))
        conn.commit()

def update_run_status(run_id: str, status: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE runs SET status = ? WHERE run_id = ?", (status, run_id))
        conn.commit()

def save_attack_record(run_id: str, attack_result: Dict[str, Any], is_rerun: bool = False):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO run_attacks
            (run_id, attack_id, name, category, severity, goal, is_hardened_rerun, verdict, reason, rendered_input, response, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_id,
            attack_result.get("id", ""),
            attack_result.get("name", ""),
            attack_result.get("category", ""),
            attack_result.get("severity", "medium"),
            attack_result.get("goal", "follow_instruction"),
            1 if is_rerun else 0,
            attack_result.get("verdict", "error"),
            attack_result.get("reason", ""),
            attack_result.get("rendered_input", ""),
            attack_result.get("response", "")[:1000],
            attack_result.get("duration_ms", 0.0),
        ))
        conn.commit()

def save_run_completion(
    run_id: str,
    initial_resistance: float,
    hardened_prompt: Optional[str] = None,
    hardened_resistance: Optional[float] = None,
    flips_count: int = 0,
    changes: Optional[List[str]] = None,
    benign_checks: Optional[List[Dict[str, Any]]] = None,
    summary_data: Optional[Dict[str, Any]] = None,
):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE runs SET
                status = 'completed',
                initial_resistance = ?,
                hardened_prompt = ?,
                hardened_resistance = ?,
                flips_count = ?,
                changes_json = ?,
                benign_checks_json = ?,
                summary_json = ?
            WHERE run_id = ?
        """, (
            initial_resistance,
            hardened_prompt,
            hardened_resistance or 0.0,
            flips_count,
            json.dumps(changes or []),
            json.dumps(benign_checks or []),
            json.dumps(summary_data or {}),
            run_id
        ))
        conn.commit()

def get_run(run_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,))
        row = cursor.fetchone()
        if not row:
            return None
        
        run_dict = dict(row)
        run_dict["changes"] = json.loads(run_dict["changes_json"]) if run_dict.get("changes_json") else []
        run_dict["benign_checks"] = json.loads(run_dict["benign_checks_json"]) if run_dict.get("benign_checks_json") else []
        run_dict["summary"] = json.loads(run_dict["summary_json"]) if run_dict.get("summary_json") else {}

        # Fetch attack records
        cursor.execute("SELECT * FROM run_attacks WHERE run_id = ? ORDER BY id ASC", (run_id,))
        attacks = [dict(r) for r in cursor.fetchall()]
        run_dict["initial_attacks"] = [a for a in attacks if not a["is_hardened_rerun"]]
        run_dict["rerun_attacks"] = [a for a in attacks if a["is_hardened_rerun"]]
        return run_dict

def list_runs(limit: int = 20) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT run_id, created_at, status, model, provider, initial_resistance, hardened_resistance, flips_count FROM runs ORDER BY created_at DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]
