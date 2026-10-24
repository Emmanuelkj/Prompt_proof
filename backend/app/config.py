import os
from pathlib import Path
from dotenv import load_dotenv

# Load local .env if present
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Model & Provider Configuration
DEFAULT_PROVIDER = os.getenv("PROMPTPROOF_PROVIDER", "ollama")
DEFAULT_MODEL = os.getenv("PROMPTPROOF_MODEL", "llama3.2:latest")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Concurrency & Runner limits
CONCURRENCY_LIMIT = int(os.getenv("CONCURRENCY_LIMIT", "4"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
DEFAULT_TIMEOUT_SECONDS = float(os.getenv("DEFAULT_TIMEOUT_SECONDS", "30.0"))

# Database
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "promptproof.db"))
