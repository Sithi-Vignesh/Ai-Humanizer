import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Model Path ─────────────────────────────────────────────────────────────────
# core/config.py lives in backend/core/, so we go up one level to reach backend/
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).parent.parent  # backend/core/ -> backend/
MODEL_PATH: Path = BASE_DIR / "models" / "ai-detector-model-v3"

# ── Environment Variables ──────────────────────────────────────────────────────
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
