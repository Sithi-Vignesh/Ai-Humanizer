from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

class TextInput (BaseModel):
    text: str

@app.post("/detect")
def detect(data: TextInput):
    return {"received": data.text}

