from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os
import io
import fitz
import docx
import re

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class TextInput(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/detect")
def detect(data: TextInput):
    if not data.text.strip():
        return {
            "label": "Unknown",
            "score": 0.0,
            "ai_percent": 0.0,
            "human_percent": 0.0
        }

    try:
        groq_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert AI text detector. Analyze the given text carefully. Consider these signals - AI text: perfect grammar, formal tone, no typos, repetitive structure, buzzwords, no personal stories. Human text: casual language, typos, contractions, personal experiences, emotional language, slang, incomplete sentences. Be accurate - do not mark clearly human casual text as AI. Return ONLY a single integer 0-100 representing AI probability. 0=definitely human, 100=definitely AI."},
                {"role": "user", "content": data.text[:8000]} # Increase limit since LLM can handle it
            ],
            temperature=0.1
        )
        
        # Parse the integer response
        groq_text = groq_response.choices[0].message.content.strip()
        numbers = re.findall(r'\d+', groq_text)
        if numbers:
            # Take the first number found, clamped between 0 and 100
            groq_score = min(max(float(numbers[0]), 0.0), 100.0)
            groq_ai_percent = groq_score / 100.0
        else:
            print(f"Groq parsing failed. Raw response: {groq_text}")
            groq_ai_percent = 0.5 # Default to unsure if parse fails
            
    except Exception as e:
        print("Groq detection failed:", e)
        groq_ai_percent = 0.5 # Fallback
        
    combined_ai = groq_ai_percent
    combined_human = 1.0 - combined_ai
    
    final_label = "AI" if combined_ai > 0.5 else "Human"
    final_score = combined_ai if final_label == "AI" else combined_human

    
    return {
        "label": final_label,
        "score": round(final_score, 4),
        "ai_percent": round(combined_ai * 100, 2),
        "human_percent": round(combined_human * 100, 2)
    }

@app.post("/humanize")
def humanize(data: TextInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Rewrite the given text to sound completely natural and human. Vary sentence length, use contractions, and remove robotic phrasing. Keep the original meaning. Return ONLY the rewritten text, no explanations, no notes, nothing else."},
            {"role": "user", "content": data.text}
        ]
    )
    result = response.choices[0].message.content
    return {"humanized": result}

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith('.pdf') or filename.endswith('.docx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .docx files are supported")
    
    contents = await file.read()
    extracted_text = ""
    
    try:
        if filename.endswith('.pdf'):
            doc = fitz.open(stream=contents, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text() + "\n"
            doc.close()
        elif filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(contents))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")
        
    return {"text": extracted_text.strip()}
