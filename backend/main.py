from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

detector = pipeline("text-classification", model="Hello-SimpleAI/chatgpt-detector-roberta")

class TextInput (BaseModel):
    text: str

@app.post("/detect")
def detect(data: TextInput):
    result = detector(data.text)
    label = result[0]['label']
    score = result[0]['score']

    if label == "Human":
        human_percent = score * 100
        ai_percent = (1 - score) * 100
    else:
        ai_percent = score * 100
        human_percent = (1 - score) * 100
        
    return {
    "label": label,
    "score": score,
    "ai_percent": round(ai_percent, 2),
    "human_percent": round(human_percent, 2)
}



