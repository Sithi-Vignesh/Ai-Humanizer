window.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const btnDetect = document.getElementById("btn-detect");
  const btnHumanize = document.getElementById("btn-humanize");
  const resultDiv = document.getElementById("result");

  btnDetect.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
      resultDiv.textContent = "Please enter some text first.";
      return;
    }

    resultDiv.textContent = "Detecting AI...";

    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      resultDiv.innerHTML = `
        <p><strong>Label:</strong> ${data.label}</p>
        <p><strong>AI:</strong> ${data.ai_percent}%</p>
        <p><strong>Human:</strong> ${data.human_percent}%</p>
      `;
    } catch (err) {
      resultDiv.textContent = "Error connecting to backend: " + err.message;
    }
  });

  btnHumanize.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
      resultDiv.textContent = "Please enter some text first.";
      return;
    }

    resultDiv.textContent = "Humanizing text...";

    try {
      const response = await fetch("http://localhost:8000/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      resultDiv.innerHTML = `<p>${data.humanized}</p>`;
    } catch (err) {
      resultDiv.textContent = "Error connecting to backend: " + err.message;
    }
  });
});
