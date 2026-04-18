// server/services/aiService.js
// ClauseWise AI Service Layer — integrates with Google Gemini API

const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-pro"; // Recommended model for complex text analysis

/**
 * Builds the structured prompt for legal document analysis
 */
function buildPrompt(text) {
  return `Analyze the following legal document and return ONLY JSON in this exact format:
{
  "summary": ["point1", "point2", "point3"],
  "riskScore": "LOW | MEDIUM | HIGH",
  "risks": [
    {
      "clause": "exact or paraphrased clause text",
      "level": "LOW | MEDIUM | HIGH",
      "explanation": "plain English reason why this is risky"
    }
  ]
}

Guidelines:
- Simplify into plain English
- Identify one-sided, restrictive, financially risky, or legally unfavorable clauses
- Keep summary concise (3-6 bullet points max)
- Each risk explanation should be 1-2 sentences
- riskScore should reflect the overall document risk (HIGH if any HIGH risks exist)
- Do not include any text outside the JSON object
- Do not use markdown code fences

Document:
${text}`;
}

/**
 * Parses and validates AI response JSON
 * Falls back gracefully on malformed responses
 */
function parseAIResponse(rawText) {
  // Strip markdown fences if present
  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (!parsed.summary || !Array.isArray(parsed.summary)) {
    throw new Error("Missing or invalid 'summary' field");
  }
  if (!["LOW", "MEDIUM", "HIGH"].includes(parsed.riskScore)) {
    throw new Error("Invalid 'riskScore' value");
  }
  if (!parsed.risks || !Array.isArray(parsed.risks)) {
    throw new Error("Missing or invalid 'risks' field");
  }

  // Normalize risk levels
  parsed.risks = parsed.risks.map((r) => ({
    clause: r.clause || "Unspecified clause",
    level: ["LOW", "MEDIUM", "HIGH"].includes(r.level) ? r.level : "MEDIUM",
    explanation: r.explanation || "No explanation provided",
  }));

  return parsed;
}

/**
 * Fallback response when AI analysis fails
 */
function getFallbackResponse(errorMessage) {
  return {
    summary: [
      "Document analysis encountered an error.",
      "Please verify your Gemini API key and try again."
    ],
    riskScore: "MEDIUM",
    risks: [
      {
        clause: "Analysis unavailable",
        level: "MEDIUM",
        explanation: `AI processing failed: ${errorMessage}. Manual review recommended.`,
      },
    ],
    _fallback: true,
    _error: errorMessage,
  };
}

/**
 * Main analysis function — call this from your route handler
 * @param {string} text - Extracted text from the legal document
 * @returns {Promise<Object>} Structured analysis result
 */
async function analyzeDocument(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("Document text is empty or invalid");
  }

  // Strictly bound text to maximum length to optimize performance
  const truncatedText = text.slice(0, 12000);
  let rawResponseText = "";

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildPrompt(truncatedText);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    rawResponseText = response.text();

    if (!rawResponseText) {
      throw new Error("Empty response from Gemini API");
    }

    return parseAIResponse(rawResponseText);
  } catch (err) {
    console.error("[aiService] Document analysis error:", err.message);
    if (rawResponseText) console.error("[aiService] Raw output:", rawResponseText);
    return getFallbackResponse(err.message);
  }
}

/**
 * AI Chat — answer a question about a document
 * @param {string} question - User's question
 * @param {string} documentContext - The analyzed document text or summary
 * @returns {Promise<string>} AI answer
 */
async function chatWithDocument(question, documentContext) {
  if (!question || !documentContext) {
    throw new Error("Both question and document context are required");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are a legal document assistant. Answer the user's question based ONLY on the document context provided. Be concise and clear. If the answer is not in the document, say so.

Document Context:
${documentContext.slice(0, 8000)}

User Question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Unable to generate a response.";
  } catch (err) {
    console.error("[aiService] Chat error:", err.message);
    throw new Error("Chat failed due to AI service issue.");
  }
}

module.exports = { analyzeDocument, chatWithDocument };
