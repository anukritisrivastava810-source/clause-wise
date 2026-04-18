// client/src/services/api.js
// ClauseWise — Frontend API service layer

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Upload and extract text from a document file
 * @param {File} file - The file object from an <input type="file">
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{ text: string, fileName: string, fileSize: number, mimeType: string }>}
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file); // Exact field name requested

  // Use XMLHttpRequest for upload progress support
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || `Server error: ${xhr.status}`));
        }
      } catch {
        reject(new Error("Invalid server response"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("timeout", () => reject(new Error("Request timed out")));

    xhr.timeout = 120000;
    xhr.open("POST", `${BASE_URL}/upload`);
    xhr.send(formData);
  });
}

/**
 * Send extracted text to AI for analysis
 * @param {Object} data - Extracted data containing text, fileName, etc.
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeText(data, userId) {
  const payload = { ...data, userId };
  
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const resultData = await res.json();
  if (!res.ok) throw new Error(resultData.error || "Failed to analyze text");
  return resultData;
}

/**
 * Fetch cached analysis for a document
 * @param {string} documentId
 * @returns {Promise<AnalysisResult>}
 */
export async function getAnalysis(documentId) {
  const res = await fetch(`${BASE_URL}/analyze/${documentId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch analysis");
  return data;
}

/**
 * Fetch document history for a user
 * @param {string} userId
 * @returns {Promise<HistoryItem[]>}
 */
export async function getHistory(userId) {
  const res = await fetch(`${BASE_URL}/history/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch history");
  return data.history;
}

/**
 * Send a chat message about a document
 * @param {string} question
 * @param {string} documentId
 * @returns {Promise<{answer: string}>}
 */
export async function chatWithDocument(question, documentId) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, documentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed");
  return data;
}
