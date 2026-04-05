from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from transformers import pipeline
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

detector = pipeline("text-classification", model="Hello-SimpleAI/chatgpt-detector-roberta")

class TextInput(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

def chunk_text(text: str, max_chunk_size=400):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if not sentence.strip():
            continue
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
            
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    if not chunks:
        chunks = [text[:max_chunk_size]] if text else [""]
    return chunks

@app.post("/detect")
def detect(data: TextInput):
    if not data.text.strip():
        return {
            "label": "Unknown",
            "score": 0.0,
            "ai_percent": 0.0,
            "human_percent": 0.0
        }

    chunks = chunk_text(data.text, max_chunk_size=400)
    total_ai = 0.0
    total_human = 0.0
    
    for chunk in chunks:
        if not chunk: continue
        # Safe-guard by aggressively truncating and explicitly requesting truncation
        result = detector(chunk[:2000], truncation=True, max_length=512)
        label = result[0]['label']
        score = result[0]['score']
        
        if label == "Human":
            total_human += score
            total_ai += (1 - score)
        else:
            total_ai += score
            total_human += (1 - score)
            
    avg_ai = total_ai / len(chunks)
    avg_human = total_human / len(chunks)
    
    final_label = "AI" if avg_ai > 0.5 else "Human"
    final_score = avg_ai if final_label == "AI" else avg_human
    
    return {
        "label": final_label,
        "score": round(final_score, 4),
        "ai_percent": round(avg_ai * 100, 2),
        "human_percent": round(avg_human * 100, 2)
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



