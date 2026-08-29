from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import routes
from services import detect_service

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up the OpenRouter LLM as the detect backend for the web build.
routes.set_detect_implementation(detect_service.detect_with_llm)

app.include_router(routes.router)
