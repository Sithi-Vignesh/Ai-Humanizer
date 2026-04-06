window.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const btnDetect = document.getElementById("btn-detect");
  const btnHumanize = document.getElementById("btn-humanize");
  const resultDiv = document.getElementById("result");
  const fileUpload = document.getElementById("file-upload");
  const exportSection = document.getElementById("export-section");
  const btnExportTxt = document.getElementById("btn-export-txt");
  const btnExportDocx = document.getElementById("btn-export-docx");
  const btnExportPdf = document.getElementById("btn-export-pdf");

  let humanizedText = "";

  const showLoading = (text) => {
    exportSection.style.display = "none";
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `<div class="loading-text">${text}</div>`;
  };

  const showError = (msg) => {
    exportSection.style.display = "none";
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `
      <div style="color: #fca5a5; padding: 1rem; text-align: center; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239,68,68,0.2);">
        ${msg}
      </div>
    `;
  };

  const showToast = (msg) => {
    const toast = document.createElement("div")
    toast.textContent = msg
    toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1e1e2e;color:#fff;padding:12px 20px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);font-size:0.85rem;z-index:9999;"
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  btnDetect.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
      showError("Please enter some text first.");
      return;
    }

    showLoading("Running AI Detection...");

    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();

      const isAI = data.ai_percent > 50;
      const badgeClass = isAI ? 'ai-brand' : 'human-brand';

      resultDiv.innerHTML = `
        <div class="detect-header">
          <div class="detect-label">Analysis Result</div>
          <div class="badge ${badgeClass}">${data.label}</div>
        </div>
        
        <div class="donut-container">
          <div class="donut-chart-wrapper">
            <div class="donut-chart" style="--human-val: 0"></div>
            <div class="donut-hole-text">
              <div class="donut-score-label">AI Score</div>
              <div class="donut-score-value">${data.ai_percent}%</div>
            </div>
          </div>
          
          <div class="donut-legend">
            <div class="legend-item">
              <div class="legend-dot ai"></div>
              <span>AI</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot human"></div>
              <span>Human</span>
            </div>
          </div>
        </div>
      `;

      // Trigger animations
      setTimeout(() => {
        const chart = resultDiv.querySelector('.donut-chart');
        if (chart) {
          chart.style.setProperty('--human-val', data.human_percent);
        }
      }, 50);

    } catch (err) {
      showError("Error connecting to backend: " + err.message);
    }
  });

  btnHumanize.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
      showError("Please enter some text first.");
      return;
    }

    showLoading("Humanizing text... This may take a minute for long documents.");

    try {
      const response = await fetch("http://localhost:8000/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();

      humanizedText = data.humanized;
      resultDiv.innerHTML = `
        <div class="humanize-result">
          ${data.humanized.replace(/\n/g, '<br/>')}
        </div>
      `;
      exportSection.style.display = "flex";
    } catch (err) {
      showError("Error connecting to backend: " + err.message);
    }
  });

  fileUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const originalText = inputText.value;
    inputText.value = "Extracting text from file, please wait...";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/extract", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      inputText.value = data.text;
    } catch (err) {
      inputText.value = originalText;
      showError("Error extracting text: " + err.message);
    }

    // Clear input so selecting the same file again triggers change event
    e.target.value = "";
  });

  // Export TXT purely via JS blob
  btnExportTxt.addEventListener("click", () => {
    if (!humanizedText) return;
    const blob = new Blob([humanizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ Downloaded! Check your Downloads folder.");
  });

  // Generic export fetcher for endpoint downloads
  const exportDocAndDownload = async (url, filename) => {
    if (!humanizedText) return;
    btnExportDocx.disabled = true;
    btnExportPdf.disabled = true;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: humanizedText })
      });
      if (!response.ok) throw new Error("Export completely failed");

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      showError("Export Error: " + err.message);
    } finally {
      btnExportDocx.disabled = false;
      btnExportPdf.disabled = false;
    }
  };

  btnExportDocx.addEventListener("click", () => exportDocAndDownload("http://localhost:8000/export/docx", "humanized.docx"));
  btnExportPdf.addEventListener("click", () => exportDocAndDownload("http://localhost:8000/export/pdf", "humanized.pdf"));
});
