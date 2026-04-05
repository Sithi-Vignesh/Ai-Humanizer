from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
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

def chunk_by_paragraphs(text: str, max_chunk_size=1000):
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = []
    current_len = 0
    
    for para in paragraphs:
        if current_len + len(para) <= max_chunk_size:
            current_chunk.append(para)
            current_len += len(para) + 1
        else:
            if current_chunk:
                chunks.append('\n'.join(current_chunk))
            current_chunk = [para]
            current_len = len(para) + 1
            
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
        
    return chunks

@app.post("/humanize")
def humanize(data: TextInput):
    if not data.text.strip():
        return {"humanized": ""}

    chunks = chunk_by_paragraphs(data.text, max_chunk_size=1000)
    humanized_chunks = []
    
    prompt = "You are a text rewriter. Rewrite the given text to sound completely natural and human. IMPORTANT RULES: Keep ALL content including names, titles, dates, numbers, headings, and metadata. Do NOT summarize, skip, condense, or remove any content. Rewrite every single line. Use contractions, vary sentence length, remove robotic phrasing. Return ONLY the rewritten text, nothing else."
    
    for chunk in chunks:
        if not chunk.strip():
            humanized_chunks.append(chunk)
            continue
            
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": chunk}
                ],
                temperature=0.3
            )
            humanized_chunks.append(response.choices[0].message.content.strip())
        except Exception as e:
            print(f"Error humanizing chunk: {e}")
            humanized_chunks.append(chunk) # Fallback to original text

    result = "\n\n".join(humanized_chunks)
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

@app.post("/export/docx")
def export_docx(data: TextInput):
    doc = docx.Document()
    doc.add_heading("Humanized Text", 0)
    for paragraph in data.text.split('\n'):
        if paragraph.strip():
            doc.add_paragraph(paragraph.strip())
            
    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        headers={"Content-Disposition": "attachment; filename=humanized.docx"}
    )

@app.post("/export/pdf")
def export_pdf(data: TextInput):
    file_stream = io.BytesIO()
    doc = SimpleDocTemplate(file_stream, pagesize=A4,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()
    Story = []
    
    Story.append(Paragraph("Humanized Text", styles["Title"]))
    Story.append(Spacer(1, 12))
    
    for paragraph in data.text.split('\n'):
        if paragraph.strip():
            Story.append(Paragraph(paragraph.strip(), styles["Normal"]))
            Story.append(Spacer(1, 6))
            
    doc.build(Story)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream, 
        media_type="application/pdf", 
        headers={"Content-Disposition": "attachment; filename=humanized.pdf"}
    )

