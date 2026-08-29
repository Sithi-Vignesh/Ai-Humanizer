const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Parse a non-ok response and throw an error carrying both
 * a human-readable `message` and a `technical` detail string.
 */
async function throwApiError(res) {
  let parsedBody = null;
  try {
    parsedBody = await res.json();
  } catch {
    // Response body wasn't valid JSON (network error, completely down, etc.)
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = `HTTP ${res.status}`;
    throw err;
  }
  const err = new Error(
    parsedBody?.detail?.message || 'Something went wrong. Please try again.'
  );
  err.technical = parsedBody?.detail?.technical || String(res.status);
  throw err;
}

/**
 * POST /detect
 * body: { text: string }
 * returns: { ai_percent: number, ... }
 */
export async function detectText(text) {
  let res;
  try {
    res = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = String(networkErr);
    throw err;
  }
  if (!res.ok) await throwApiError(res);
  return res.json();
}

/**
 * POST /humanize
 * body: { text: string, strength: string }
 * returns: { humanized: string }
 */
export async function humanizeText(text, strength) {
  let res;
  try {
    res = await fetch(`${API_BASE}/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, strength }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = String(networkErr);
    throw err;
  }
  if (!res.ok) await throwApiError(res);
  return res.json();
}

/**
 * POST /extract
 * body: multipart FormData with key "file"
 * returns: { text: string }
 */
export async function extractFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  let res;
  try {
    res = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = String(networkErr);
    throw err;
  }
  if (!res.ok) await throwApiError(res);
  return res.json();
}

/**
 * POST /export/docx
 * body: { text: string }
 * returns: Blob
 */
export async function exportDocx(text) {
  let res;
  try {
    res = await fetch(`${API_BASE}/export/docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = String(networkErr);
    throw err;
  }
  if (!res.ok) await throwApiError(res);
  return res.blob();
}

/**
 * POST /export/pdf
 * body: { text: string }
 * returns: Blob
 */
export async function exportPdf(text) {
  let res;
  try {
    res = await fetch(`${API_BASE}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please check your connection.');
    err.technical = String(networkErr);
    throw err;
  }
  if (!res.ok) await throwApiError(res);
  return res.blob();
}
