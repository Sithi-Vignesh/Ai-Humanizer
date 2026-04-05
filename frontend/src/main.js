window.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const btnDetect = document.getElementById("btn-detect");
  const btnHumanize = document.getElementById("btn-humanize");
  const resultDiv = document.getElementById("result");

  const showLoading = (text) => {
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `<div class="loading-text">${text}</div>`;
  };

  const showError = (msg) => {
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `
      <div style="color: #fca5a5; padding: 1rem; text-align: center; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239,68,68,0.2);">
        ${msg}
      </div>
    `;
  };

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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const isAI = data.ai_percent > 50;
      const badgeClass = isAI ? 'ai-brand' : 'human-brand';
      
      resultDiv.innerHTML = `
        <div class="detect-header">
          <div class="detect-label">Analysis Result</div>
          <div class="badge ${badgeClass}">${data.label}</div>
        </div>
        
        <div class="progress-group">
          <div class="progress-header">
            <span>AI Probability</span>
            <span>${data.ai_percent}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-red" style="width: 0%"></div>
          </div>
        </div>

        <div class="progress-group">
          <div class="progress-header">
            <span>Human Probability</span>
            <span>${data.human_percent}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-green" style="width: 0%"></div>
          </div>
        </div>
      `;
      
      // Trigger animations
      setTimeout(() => {
        const fills = resultDiv.querySelectorAll('.progress-bar-fill');
        if (fills.length >= 2) {
            fills[0].style.width = `${data.ai_percent}%`;
            fills[1].style.width = `${data.human_percent}%`;
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

    showLoading("Humanizing text...");

    try {
      const response = await fetch("http://localhost:8000/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      resultDiv.innerHTML = `
        <div class="humanize-result">
          ${data.humanized.replace(/\n/g, '<br/>')}
        </div>
      `;
    } catch (err) {
      showError("Error connecting to backend: " + err.message);
    }
  });
});
