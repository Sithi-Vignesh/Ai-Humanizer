from fastapi import HTTPException


def validate_extract_filename(filename: str) -> None:
    """Raise HTTP 400 if the filename is not a .pdf or .docx file."""
    lowered = filename.lower() if filename else ""
    if not (lowered.endswith(".pdf") or lowered.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail="Only .pdf and .docx files are supported",
        )
