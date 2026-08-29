# 🧠 AI-Humanizer

A full-stack application that detects AI-generated text and humanizes it with adjustable intensity. Available as both a **desktop app** and a **web app**.

---

## 🌐 Web Version (Live)

> 🔗 [Try it now on GitHub Pages](https://sithi-vignesh.github.io/Ai-Humanizer/)

- Backend hosted on **Render** (FastAPI)
- Frontend hosted on **GitHub Pages**
- Detection and humanization powered by **OpenRouter**
- No setup needed — just open and use

---

## 🖥️ Desktop Version (Download)

> 📦 [Download AI-Humanizer v1.0.0](https://github.com/Sithi-Vignesh/Ai-Humanizer/releases/tag/v1.0.0)

**Requirements:** Windows 10/11 (64-bit) · [OpenRouter API key](https://openrouter.ai)

### Installation
1. Download `AI-Humanizer-v1.0.0.zip` from the link above
2. Extract the folder anywhere on your PC
3. Open the `backend/` folder
4. Rename `.env.example` to `.env`
5. Paste your OpenRouter API key inside
6. Run `AI-Humanizer.exe`

---

## ✨ Features

- **AI Text Detection** — fine-tuned RoBERTa model (99.71% accuracy, desktop) / OpenRouter LLM (web)
- **3-Level Humanization** — Light, Medium, and Heavy modes via OpenRouter
- **File Upload Support** — extract and analyze text from PDF and DOCX files
- **Export Results** — download humanized text as TXT, PDF, or DOCX
- **Chunk-based Processing** — paragraph-by-paragraph processing for accurate long document handling
- **Auto-launch Backend** — backend starts automatically when the desktop app opens

---

## 🛠️ Tech Stack

| Layer | Desktop | Web |
|---|---|---|
| Backend | FastAPI (local) | FastAPI on Render |
| AI Detection | Fine-tuned RoBERTa-base (local) | OpenRouter |
| Humanization | OpenRouter | OpenRouter |
| Frontend | React (Vite) | React (Vite) on GitHub Pages |
| File Processing | PyMuPDF (PDF), python-docx (DOCX) | PyMuPDF (PDF), python-docx (DOCX) |
| Export | ReportLab (PDF), python-docx (DOCX) | ReportLab (PDF), python-docx (DOCX) |

---

## 📁 Project Structure

```
Ai-Humanizer/
├── backend/
│   ├── api/                          # FastAPI route definitions
│   ├── core/                         # Config, file validation, LLM client
│   ├── services/                     # Detect, humanize, export logic
│   ├── main.py                       # Desktop entrypoint (RoBERTa detection)
│   ├── main_web.py                   # Web entrypoint (OpenRouter detection)
│   ├── requirements.txt
│   └── models/
│       └── ai-detector-model-v3/     # Fine-tuned RoBERTa (not in repo — too large)
├── frontend-new/
│   └── src/                          # React (Vite) frontend
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

## 🤖 AI Detection Model (Desktop)

Detection uses a fine-tuned `roberta-base` model trained on 50,000 balanced samples from the [Kaggle AI vs Human Text dataset](https://www.kaggle.com/datasets/shanegerami/ai-vs-human-text).

- **Accuracy:** 99.71% on 10k test set
- **Training:** 3 epochs on Google Colab
- **Note:** Model is excluded from the repo due to size but bundled inside the zip release

---

## 🚀 Dev Setup

### Backend (Desktop)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Add your OpenRouter API key
uvicorn main:app --reload
```

### Backend (Web)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Add your OpenRouter API key
uvicorn main_web:app --reload
```

### Frontend
```bash
cd frontend-new
npm install
npm run dev
```

---

## 🔮 Future Improvements

- Chunked detection for long documents (beyond 512 tokens)
- Sentence-level AI highlighting
- Batch file processing
- Mobile version

---

## 👨‍💻 Author

**Sithi Vignesh** — CS (AI/ML), VIT Vellore  
[GitHub](https://github.com/Sithi-Vignesh) | [LinkedIn](https://linkedin.com/in/sithi-vignesh)