function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function OutputPanel({ value, onCopyClick, onExportTxt, onExportDocx, onExportPdf }) {
  const count = value.trim() === '' ? 0 : wordCount(value);

  return (
    <div className="panel panel-right">
      <div className="panel-toolbar">
        <span className="panel-label">Humanized Text</span>
        <div className="toolbar-actions">
          <span className="word-count" id="word-count-out">{count} words</span>
          <button className="icon-btn" id="copy-btn" title="Copy to clipboard" onClick={onCopyClick}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        </div>
      </div>

      <textarea
        id="output-text"
        placeholder="Your humanized text will appear here…"
        readOnly
        spellCheck={false}
        value={value}

      />

      <div className="export-bar">
        <span className="export-label">Export as</span>
        <button className="export-btn" id="export-txt" onClick={onExportTxt}>.TXT</button>
        <button className="export-btn" id="export-docx" onClick={onExportDocx}>.DOCX</button>
        <button className="export-btn" id="export-pdf" onClick={onExportPdf}>.PDF</button>
      </div>
    </div>
  );
}
