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

# Wire up the local RoBERTa model as the detect backend for the desktop build.
routes.set_detect_implementation(detect_service.detect_with_roberta)

app.include_router(routes.router)

# ── Entry Point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)