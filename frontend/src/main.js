const API_BASE = "http://localhost:8000";

const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const detectBtn = document.getElementById("detect-btn");
const humanizeBtn = document.getElementById("humanize-btn");
const strengthSelect = document.getElementById("strength");
const wordCountIn = document.getElementById("word-count-in");
const wordCountOut = document.getElementById("word-count-out");
const fileUpload = document.getElementById("file-upload");
const copyBtn = document.getElementById("copy-btn");
const exportTxt = document.getElementById("export-txt");
const exportDocx = document.getElementById("export-docx");
const exportPdf = document.getElementById("export-pdf");

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// ── Word count ─────────────────────────────────────────────
inputText.addEventListener("input", () => {
  const words = inputText.value.trim().split(/\s+/).filter(Boolean).length;
  wordCountIn.textContent = words + " words";
});

// ── File upload ────────────────────────────────────────────
fileUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  showLoading("Extracting text…");
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/extract`, { method: "POST", body: formData });
    const data = await res.json();
    inputText.value = data.text;
    const words = data.text.trim().split(/\s+/).filter(Boolean).length;
    wordCountIn.textContent = words + " words";
    showToast("File extracted ✓");
  } catch {
    showToast("Failed to extract file.");
  } finally {
    hideLoading();
    fileUpload.value = "";
  }
});

// ── Detect ─────────────────────────────────────────────────
detectBtn.addEventListener("click", async () => {
  if (!inputText.value.trim()) { showToast("Paste some text first."); return; }
  showLoading("Analysing text…");
  try {
    const res = await fetch(`${API_BASE}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText.value })
    });
    const data = await res.json();
    renderDetect(data.ai_percent / 100);
  } catch {
    showToast("Detection failed. Try again.");
  } finally {
    hideLoading();
  }
});

// ── Humanize ───────────────────────────────────────────────
humanizeBtn.addEventListener("click", async () => {
  if (!inputText.value.trim()) { showToast("Paste some text first."); return; }
  showLoading("Humanizing your text…");
  try {
    const res = await fetch(`${API_BASE}/humanize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText.value, strength: strengthSelect.value || "light" })
    });
    const data = await res.json();
    outputText.value = data.humanized;
    const words = data.humanized.trim().split(/\s+/).filter(Boolean).length;
    wordCountOut.textContent = words + " words";
    showToast("Humanized ✓");
  } catch {
    showToast("Humanization failed. Try again.");
  } finally {
    hideLoading();
  }
});

// ── Copy ───────────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  if (!outputText.value.trim()) { showToast("Nothing to copy yet."); return; }
  navigator.clipboard.writeText(outputText.value);
  showToast("Copied to clipboard ✓");
});

// ── Export TXT ─────────────────────────────────────────────
exportTxt.addEventListener("click", () => {
  if (!outputText.value.trim()) { showToast("Nothing to export yet."); return; }
  const blob = new Blob([outputText.value], { type: "text/plain" });
  triggerDownload(blob, "humanized.txt");
  showToast("Downloaded .txt ✓");
});

// ── Export DOCX ────────────────────────────────────────────
exportDocx.addEventListener("click", async () => {
  if (!outputText.value.trim()) { showToast("Nothing to export yet."); return; }
  showLoading("Generating DOCX…");
  try {
    const res = await fetch(`${API_BASE}/export/docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: outputText.value })
    });
    const blob = await res.blob();
    triggerDownload(blob, "humanized.docx");
    showToast("Downloaded .docx ✓");
  } catch {
    showToast("DOCX export failed.");
  } finally {
    hideLoading();
  }
});

// ── Export PDF ─────────────────────────────────────────────
exportPdf.addEventListener("click", async () => {
  if (!outputText.value.trim()) { showToast("Nothing to export yet."); return; }
  showLoading("Generating PDF…");
  try {
    const res = await fetch(`${API_BASE}/export/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: outputText.value })
    });
    const blob = await res.blob();
    triggerDownload(blob, "humanized.pdf");
    showToast("Downloaded .pdf ✓");
  } catch {
    showToast("PDF export failed.");
  } finally {
    hideLoading();
  }
});

// ── Helpers ────────────────────────────────────────────────
function triggerDownload(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}