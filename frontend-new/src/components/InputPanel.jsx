import { useRef } from 'react';

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function dotClass(detectResult) {
  if (!detectResult) return '';
  const pct = detectResult.ai_percent;
  if (pct >= 70) return 'dot-high';
  if (pct >= 40) return 'dot-mid';
  return 'dot-low';
}

export default function InputPanel({ value, onChange, onFileUpload, detectResult, onDetectClick }) {
  const fileInputRef = useRef(null);
  const count = value.trim() === '' ? 0 : wordCount(value);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  const dotCls = dotClass(detectResult);
  const detectLabel = detectResult
    ? `${detectResult.ai_percent.toFixed(1)}% AI probability`
    : 'Not analysed yet';

  return (
    <div className="panel panel-left">
      <div className="panel-toolbar">
        <span className="panel-label">Original Text</span>
        <div className="toolbar-actions">
          <span className="word-count" id="word-count-in">{count} words</span>
          <label
            className="upload-btn"
            htmlFor="file-upload"
            title="Upload PDF or Word file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.docx"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <textarea
        id="input-text"
        placeholder="Paste your AI-generated text here, or upload a PDF / Word document above…"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="detect-bar" id="detect-bar">
        <div className="detect-indicator" id="detect-indicator">
          <div className={`indicator-dot${dotCls ? ' ' + dotCls : ''}`} id="indicator-dot" />
          <span id="detect-label">{detectLabel}</span>
        </div>
        <button className="btn-detect" id="detect-btn" onClick={onDetectClick}>
          Analyse
        </button>
      </div>
    </div>
  );
}
