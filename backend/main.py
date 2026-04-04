from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

detector = pipeline("text-classification", model="Hello-SimpleAI/chatgpt-detector-roberta")

class TextInput(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/detect")
def detect(data: TextInput):
    result = detector(data.text)
    label = result[0]['label']
    score = result[0]['score']
    if label == "Human":
        human_percent = round(score * 100, 2)
        ai_percent = round((1 - score) * 100, 2)
    else:
        ai_percent = round(score * 100, 2)
        human_percent = round((1 - score) * 100, 2)
    return {
        "label": label,
        "score": score,
        "ai_percent": ai_percent,
        "human_percent": human_percent
    }

@app.post("/humanize")
def humanize(data: TextInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Rewrite the given text to sound completely natural and human. Vary sentence length, use contractions, add subtle imperfections, and remove any robotic or overly formal phrasing. Keep the original meaning intact."},
            {"role": "user", "content": data.text}
        ]
    )
    result = response.choices[0].message.content
    return {"humanized": result}





