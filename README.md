# 🧠 AI-Humanizer

A full-stack desktop application that detects AI-generated text and humanizes it with adjustable intensity. Built with FastAPI, a fine-tuned RoBERTa model, Groq LLM, and a Tauri desktop frontend.

---

## ⬇️ Download

> 📦 [Download AI-Humanizer v1.0.0](https://github.com/Sithi-Vignesh/Ai-Humanizer/releases/tag/v1.0.0)

**Requirements:** Windows 10/11 (64-bit) · Free [Groq API key](https://console.groq.com)

### Installation
1. Download `AI-Humanizer-v1.0.0.zip` from the link above
2. Extract the folder anywhere on your PC
3. Open the `backend/` folder
4. Rename `.env.example` to `.env`
5. Paste your Groq API key inside
6. Run `AI-Humanizer.exe`

---

## ✨ Features

- **AI Text Detection** — fine-tuned RoBERTa model (99.71% accuracy) trained on 50k samples
- **3-Level Humanization** — Light, Medium, and Heavy modes via Groq LLaMA 3.3 70B
- **File Upload Support** — extract and analyze text from PDF and DOCX files
- **Export Results** — download humanized text as TXT, PDF, or DOCX
- **Chunk-based Processing** — paragraph-by-paragraph processing for accurate long document handling
- **Auto-launch Backend** — backend starts automatically when the app opens, no terminal needed

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| AI Detection | Fine-tuned RoBERTa-base (local) |
| Humanization | LLaMA 3.3 70B via Groq API |
| Frontend | Tauri + Vanilla JS |
| File Processing | PyMuPDF (PDF), python-docx (DOCX) |
| Export | ReportLab (PDF), python-docx (DOCX) |

---

## 📁 Project Structure

```
Ai-Humanizer/
├── backend/
│   ├── main.py                       # FastAPI — detect, humanize, extract, export
│   ├── requirements.txt
│   └── models/
│       └── ai-detector-model-v3/     # Fine-tuned RoBERTa (not in repo — too large)
├── frontend/
│   ├── src/                          # Vanilla JS frontend
│   └── src-tauri/                    # Tauri + Rust config
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/detect` | Detect if text is AI or Human |
| POST | `/humanize` | Humanize text with selected strength |
| POST | `/extract` | Extract text from PDF or DOCX |
| POST | `/export/pdf` | Export as PDF |
| POST | `/export/docx` | Export as DOCX |

---

## 🎚️ Humanization Levels

| Level | Description |
|---|---|
| **Light** | Fix robotic phrasing, smooth grammar |
| **Medium** | Natural rewrite with contractions, varied sentence length |
| **Heavy** | Fully conversational, highly organic style |

---

## 🤖 AI Detection Model

Detection uses a fine-tuned `roberta-base` model trained on 50,000 balanced samples from the [Kaggle AI vs Human Text dataset](https://www.kaggle.com/datasets/shanegerami/ai-vs-human-text).

- **Accuracy:** 99.71% on 10k test set
- **Training:** 3 epochs on Google Colab
- **Note:** Model is excluded from the repo due to size but bundled inside the zip release

---

## 🚀 Dev Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Add your Groq API key
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npx tauri dev
```

---

## 🔮 Future Improvements

- Web version
- Chunked detection for long documents (beyond 512 tokens)
- Sentence-level AI highlighting
- Batch file processing

---

## 👨‍💻 Author

**Sithi Vignesh** — CS (AI/ML), VIT Vellore  
[GitHub](https://github.com/Sithi-Vignesh) | [LinkedIn](https://linkedin.com/in/sithi-vignesh)
