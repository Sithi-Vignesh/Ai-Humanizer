import re
import traceback

import torch
from fastapi import HTTPException
from transformers import RobertaForSequenceClassification, RobertaTokenizer

from core.config import MODEL_PATH
from core.llm import client, LLM_MODEL

# ── RoBERTa model – loaded once at import time (used by detect_with_roberta) ──
# RobertaTokenizer / RobertaForSequenceClassification with local_files_only=True
# is required to work around a transformers path-validation bug.
tokenizer_local = RobertaTokenizer.from_pretrained(
    str(MODEL_PATH), local_files_only=True
)
model_local = RobertaForSequenceClassification.from_pretrained(
    str(MODEL_PATH), local_files_only=True
)
model_local.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_local.to(device)


# ── Public API ─────────────────────────────────────────────────────────────────

def detect_with_llm(text: str) -> dict:
    """Detect AI content using LLM (used by main_web.py)."""
    if not text.strip():
        return {"label": "Unknown", "score": 0.0, "ai_percent": 0.0, "human_percent": 0.0}

    try:
        llm_response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI text detector. Analyze the given text carefully. "
                        "Consider these signals - AI text: perfect grammar, formal tone, no typos, "
                        "repetitive structure, buzzwords, no personal stories. Human text: casual "
                        "language, typos, contractions, personal experiences, emotional language, "
                        "slang, incomplete sentences. Be accurate - do not mark clearly human casual "
                        "text as AI. Return ONLY a single integer 0-100 representing AI probability. "
                        "0=definitely human, 100=definitely AI."
                    ),
                },
                {"role": "user", "content": text[:8000]},  # Increase limit since LLM can handle it
            ],
            temperature=0.1,
        )

        # Parse the integer response
        llm_text = llm_response.choices[0].message.content.strip()
        numbers = re.findall(r"\d+", llm_text)
        if numbers:
            # Take the first number found, clamped between 0 and 100
            llm_score = min(max(float(numbers[0]), 0.0), 100.0)
            llm_ai_percent = llm_score / 100.0
        else:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "AI service returned an unexpected response. Please try again.",
                    "technical": f"Parsing failed: {llm_text}",
                },
            )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI service is currently unavailable. Please try again.",
                "technical": str(e),
            },
        )

    combined_ai = llm_ai_percent
    combined_human = 1.0 - combined_ai

    final_label = "AI" if combined_ai > 0.5 else "Human"
    final_score = combined_ai if final_label == "AI" else combined_human

    return {
        "label": final_label,
        "score": round(final_score, 4),
        "ai_percent": round(combined_ai * 100, 2),
        "human_percent": round(combined_human * 100, 2),
    }


def detect_with_roberta(text: str) -> dict:
    """Detect AI content using the local fine-tuned RoBERTa model (used by main.py)."""
    if not text.strip():
        return {"label": "Unknown", "score": 0.0, "ai_percent": 0.0, "human_percent": 0.0}

    inputs = tokenizer_local(
        text[:512],
        return_tensors="pt",
        truncation=True,
        max_length=512,
    ).to(device)

    with torch.no_grad():
        outputs = model_local(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        ai_percent = probs[0][1].item()

    human_percent = 1.0 - ai_percent
    label = "AI" if ai_percent > 0.5 else "Human"
    score = ai_percent if label == "AI" else human_percent

    return {
        "label": label,
        "score": round(score, 4),
        "ai_percent": round(ai_percent * 100, 2),
        "human_percent": round(human_percent * 100, 2),
    }
