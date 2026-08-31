import { useState, useEffect, useCallback, useRef } from 'react';
import './styles/style.css';

import Header from './components/Header';
import Hero from './components/Hero';
import InputPanel from './components/InputPanel';
import CenterControls from './components/CenterControls';
import OutputPanel from './components/OutputPanel';
import LoadingOverlay from './components/LoadingOverlay';
import NotificationCard from './components/NotificationCard';

import * as api from './api/api';

// ── Download helper (mirrors triggerDownload in app.js) ─────────────────────
function triggerDownload(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function App() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('selectedModel') || 'minimax/minimax-m3:free');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  // notification: { type, message, technical, retryAction } | null
  const [notification, setNotification] = useState(null);
  const [detectResult, setDetectResult] = useState(null);

  // Ref to hold the success auto-dismiss timer so we can cancel it on early close
  const notifTimerRef = useRef(null);

  // ── Theme effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // ── Notification ───────────────────────────────────────────────────────────
  /**
   * showNotification(type, message, technical = null, retryAction = null)
   *   'success' — auto-dismissed after 2200 ms
   *   'error'   — persistent; user must close manually or click Retry
   */
  const showNotification = useCallback((type, message, technical = null, retryAction = null) => {
    // Cancel any pending auto-dismiss from a previous success notification
    clearTimeout(notifTimerRef.current);
    setNotification({ type, message, technical, retryAction });
    if (type === 'success') {
      notifTimerRef.current = setTimeout(() => setNotification(null), 2200);
    }
    // error type: no auto-clear
  }, []);

  const closeNotification = useCallback(() => {
    clearTimeout(notifTimerRef.current);
    setNotification(null);
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  const showLoading = useCallback((msg) => {
    setLoadingMessage(msg || 'Processing…');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  // ── File upload ───────────────────────────────────────────────────────────
  // handleFileUpload takes a `file` argument from the upload event.
  // The retry closure captures that specific File object — correct, since the
  // user wants to retry uploading the same file they already selected.
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    showLoading('Extracting text…');
    try {
      const data = await api.extractFile(file);
      setInputText(data.text);
      showNotification('success', 'File extracted ✓');
    } catch (err) {
      showNotification('error', err.message, err.technical, () => handleFileUpload(file));
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showNotification]);

  // ── Detect ────────────────────────────────────────────────────────────────
  // Reads inputText from component state at call time — no stale closure risk.
  const handleDetectClick = useCallback(async () => {
    if (!inputText.trim()) { showNotification('success', 'Paste some text first.'); return; }
    showLoading('Analysing text…');
    try {
      const data = await api.detectText(inputText);
      setDetectResult(data);
    } catch (err) {
      showNotification('error', err.message, err.technical, () => handleDetectClick());
    } finally {
      hideLoading();
    }
  }, [inputText, showLoading, hideLoading, showNotification]);

  // ── Humanize ──────────────────────────────────────────────────────────────
  // Reads inputText from component state at call time.
  const handleHumanizeClick = useCallback(async () => {
    if (!inputText.trim()) { showNotification('success', 'Paste some text first.'); return; }
    showLoading('Humanizing your text…');
    try {
      const data = await api.humanizeText(inputText, selectedModel);
      setOutputText(data.humanized);
      showNotification('success', 'Humanized ✓');
    } catch (err) {
      showNotification('error', err.message, err.technical, () => handleHumanizeClick());
    } finally {
      hideLoading();
    }
  }, [inputText, selectedModel, showLoading, hideLoading, showNotification]);

  // ── Copy ──────────────────────────────────────────────────────────────────
  // No API call — no retry needed.
  const handleCopyClick = useCallback(() => {
    if (!outputText.trim()) { showNotification('success', 'Nothing to copy yet.'); return; }
    navigator.clipboard.writeText(outputText);
    showNotification('success', 'Copied to clipboard ✓');
  }, [outputText, showNotification]);

  // ── Export TXT ────────────────────────────────────────────────────────────
  // No API call — no retry needed.
  const handleExportTxt = useCallback(() => {
    if (!outputText.trim()) { showNotification('success', 'Nothing to export yet.'); return; }
    const blob = new Blob([outputText], { type: 'text/plain' });
    triggerDownload(blob, 'humanized.txt');
    showNotification('success', 'Downloaded .txt ✓');
  }, [outputText, showNotification]);

  // ── Export DOCX ───────────────────────────────────────────────────────────
  // Reads outputText from component state at call time.
  const handleExportDocx = useCallback(async () => {
    if (!outputText.trim()) { showNotification('success', 'Nothing to export yet.'); return; }
    showLoading('Generating DOCX…');
    try {
      const blob = await api.exportDocx(outputText);
      triggerDownload(blob, 'humanized.docx');
      showNotification('success', 'Downloaded .docx ✓');
    } catch (err) {
      showNotification('error', err.message, err.technical, () => handleExportDocx());
    } finally {
      hideLoading();
    }
  }, [outputText, showLoading, hideLoading, showNotification]);

  // ── Export PDF ────────────────────────────────────────────────────────────
  // Reads outputText from component state at call time.
  const handleExportPdf = useCallback(async () => {
    if (!outputText.trim()) { showNotification('success', 'Nothing to export yet.'); return; }
    showLoading('Generating PDF…');
    try {
      const blob = await api.exportPdf(outputText);
      triggerDownload(blob, 'humanized.pdf');
      showNotification('success', 'Downloaded .pdf ✓');
    } catch (err) {
      showNotification('error', err.message, err.technical, () => handleExportPdf());
    } finally {
      hideLoading();
    }
  }, [outputText, showLoading, hideLoading, showNotification]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header toggleTheme={toggleTheme} />

      <main className="main">
        <Hero />

        <div className="workspace">
          <InputPanel
            value={inputText}
            onChange={setInputText}
            onFileUpload={handleFileUpload}
            detectResult={detectResult}
            onDetectClick={handleDetectClick}
          />

          <CenterControls
            onHumanizeClick={handleHumanizeClick}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <OutputPanel
            value={outputText}
            onCopyClick={handleCopyClick}
            onExportTxt={handleExportTxt}
            onExportDocx={handleExportDocx}
            onExportPdf={handleExportPdf}
          />
        </div>

        <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
      </main>

      <footer className="footer">
        <p>AI Humanizer &nbsp;·&nbsp; Built by Sithi Vignesh</p>
      </footer>

      {notification && (
        <NotificationCard
          type={notification.type}
          message={notification.message}
          technical={notification.technical}
          onClose={closeNotification}
          onRetry={notification.retryAction
            ? () => { closeNotification(); notification.retryAction(); }
            : null
          }
        />
      )}
    </>
  );
}
