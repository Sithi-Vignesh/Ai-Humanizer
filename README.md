# 🤖 Ai-Humanizer

A full-stack desktop application that detects AI-generated text and humanizes it with adjustable intensity. Built with a FastAPI backend, Groq LLM API, and a Tauri + Rust desktop frontend.

---

## ✨ Features

- **AI Text Detection** — analyzes text and returns an AI probability score (0–100%) using LLaMA 3.3 70B
- **3-Level Humanization** — Light, Medium, and Heavy humanization modes with distinct rewriting styles
- **File Upload Support** — extract and analyze text directly from PDF and DOCX files
- **Export Results** — download humanized text as PDF or DOCX
- **Chunk-based Processing** — intelligently splits large documents into paragraphs for accurate humanization
- **Desktop App** — built with Tauri + Rust for a native desktop experience

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| LLM | LLaMA 3.3 70B via Groq API |
| Frontend | Tauri + Rust |
| File Processing | PyMuPDF (PDF), python-docx (DOCX) |
| Export | ReportLab (PDF), python-docx (DOCX) |

---

## 📁 Project Structure

```
Ai-Humanizer/
├── backend/
│   ├── main.py            # FastAPI app — detect, humanize, extract, export endpoints
│   ├── test_groq.py       # Groq API connection test
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/               # Tauri + Rust frontend source
│   ├── src-tauri/         # Rust Tauri config
│   └── package.json
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/detect` | Detect if text is AI or Human |
| POST | `/humanize` | Humanize text with selected strength |
| POST | `/extract` | Extract text from PDF or DOCX |
| POST | `/export/pdf` | Export humanized text as PDF |
| POST | `/export/docx` | Export humanized text as DOCX |

---

## 🎚️ Humanization Levels

| Level | Description |
|---|---|
| **Light** | Fix robotic phrasing, smooth grammar, resolve disjointed sentences |
| **Medium** | Rewrite naturally with contractions, varied sentence length |
| **Heavy** | Fully conversational, slang where appropriate, highly organic style |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Add your Groq API key to a `.env` file:
```
GROQ_API_KEY=your_groq_api_key_here
```

Run the server:
```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run tauri dev
```

---

## 🔮 Future Improvements

- Fine-tuned RoBERTa model for offline AI detection
- Sentence-level highlighting of AI vs human text
- Browser extension version
- Batch file processing

---

## 👨‍💻 Author

**Sithi Vignesh** — CS (AI/ML), VIT Vellore
[GitHub](https://github.com/Sithi-Vignesh) | [LinkedIn](https://linkedin.com/in/sithi-vignesh)
