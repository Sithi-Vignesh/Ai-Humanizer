from fastapi import HTTPException

from core.llm import client, LLM_MODEL


# ── Helpers ────────────────────────────────────────────────────────────────────

def chunk_by_paragraphs(text: str, max_chunk_size: int = 1000) -> list[str]:
    """Split *text* into chunks that respect paragraph boundaries."""
    paragraphs = text.split("\n")
    chunks, current_chunk, current_len = [], [], 0
    for para in paragraphs:
        if current_len + len(para) <= max_chunk_size:
            current_chunk.append(para)
            current_len += len(para) + 1
        else:
            if current_chunk:
                chunks.append("\n".join(current_chunk))
            current_chunk = [para]
            current_len = len(para) + 1
    if current_chunk:
        chunks.append("\n".join(current_chunk))
    return chunks


# ── Public API ─────────────────────────────────────────────────────────────────

def humanize_text(text: str, strength: str) -> str:
    """Rewrite *text* at the requested humanisation *strength* and return it."""
    if not text.strip():
        return ""

    instructions = {
        "light": "Keep the tone mostly similar to the original, just fix slight robotic phrasing, adjust grammar smoothly, and resolve disjointed sentences.",
        "medium": "Rewrite to sound completely natural and human. Use standard contractions, vary sentence length, and remove generic robotic phrasing.",
        "heavy": "Completely rewrite in a highly conversational, extremely organic style. Sound very human. Use slang where appropriate, strong contractions, and dynamic sentence structure.",
    }
    strength_instruction = instructions.get(strength.lower(), instructions["medium"])
    prompt = (
        f"You are a text rewriter. {strength_instruction} "
        "IMPORTANT RULES: Keep ALL content including names, titles, dates, numbers, headings, "
        "and metadata. Do NOT summarize, skip, condense, or remove any content. "
        "Rewrite every single line. Return ONLY the rewritten text, nothing else."
    )

    chunks = chunk_by_paragraphs(text, max_chunk_size=1000)
    humanized_chunks = []

    for chunk in chunks:
        if not chunk.strip():
            humanized_chunks.append(chunk)
            continue
        try:
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": chunk},
                ],
                temperature=0.3,
            )
            humanized_chunks.append(response.choices[0].message.content.strip())
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "AI service is currently unavailable. Please try again.",
                    "technical": str(e),
                },
            )

    return "\n\n".join(humanized_chunks)
