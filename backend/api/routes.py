import io
from typing import Callable, Optional


import fitz
import docx
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from core.file_validation import validate_extract_filename
from services import export_service, humanize_service

router = APIRouter()

# ── Pydantic model (single source of truth) ───────────────────────────────────

class TextInput(BaseModel):
    text: str
    strength: str = "medium"


class HumanizeInput(BaseModel):
    text: str
    model: str | None = None


# ── Detect implementation slot ────────────────────────────────────────────────
# Set by the entrypoint (main.py or main_web.py) before the server starts.

_detect_impl: Optional[Callable[[str], dict]] = None


def set_detect_implementation(fn: Callable[[str], dict]) -> None:
    """Wire up the detect backend. Must be called before the app starts serving."""
    global _detect_impl
    _detect_impl = fn


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/detect")
def detect(data: TextInput):
    if _detect_impl is None:
        raise HTTPException(
            status_code=500,
            detail="Detect implementation not configured. Call set_detect_implementation() at startup.",
        )
    return _detect_impl(data.text)


@router.post("/humanize")
def humanize(data: HumanizeInput):
    if not data.text.strip():
        return {"humanized": ""}
    result = humanize_service.humanize_text(data.text, model=data.model)
    return {"humanized": result}


@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    validate_extract_filename(file.filename)

    filename = file.filename.lower() if file.filename else ""
    contents = await file.read()
    extracted_text = ""

    try:
        if filename.endswith(".pdf"):
            doc = fitz.open(stream=contents, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text() + "\n"
            doc.close()
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(contents))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Could not read that file. Please check it's a valid PDF or Word document.",
                "technical": str(e),
            },
        )

    return {"text": extracted_text.strip()}


@router.post("/export/docx")
def export_docx(data: TextInput):
    return export_service.generate_docx(data.text)


@router.post("/export/pdf")
def export_pdf(data: TextInput):
    return export_service.generate_pdf(data.text)
