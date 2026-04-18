// server/routes/analyze.js
// ClauseWise — Analysis & Chat routes

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const router = express.Router();

const { analyzeDocument, chatWithDocument } = require("../services/aiService");
const Analysis = require("../models/Analysis");
const Document = require("../models/Document");

// ─── POST /analyze ────────────────────────────────────────────────────────────
// Accepts: application/json with { text, fileName, fileSize, mimeType, userId }
// Returns: { documentId, analysisId, summary, riskScore, risks, cached }
router.post("/analyze", express.json(), async (req, res) => {
  try {
    const { text: extractedText, fileName, fileSize, mimeType } = req.body;
    
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({ error: "Document text appears to be empty or unreadable" });
    }

    const userId = req.body.userId || req.user?._id || "anonymous";



    // 2. Save document record to DB
    const docRecord = await Document.create({
      userId,
      fileName: fileName || "Pasted Document",
      fileSize: fileSize || extractedText.length,
      mimeType: mimeType || "text/plain",
      extractedText,
    });

    // 3. Call AI analysis service
    const aiResult = await analyzeDocument(extractedText);

    // 4. Save analysis to MongoDB
    const analysisRecord = await Analysis.create({
      documentId: docRecord._id,
      summary: aiResult.summary,
      riskScore: aiResult.riskScore,
      risks: aiResult.risks,
      _fallback: aiResult._fallback || false,
    });

    // 5. Update document with analysis reference (cache)
    await Document.findByIdAndUpdate(docRecord._id, {
      analysisId: analysisRecord._id,
    });

    // 6. Return structured response
    return res.status(200).json({
      documentId: docRecord._id,
      analysisId: analysisRecord._id,
      fileName: docRecord.fileName,
      summary: aiResult.summary,
      riskScore: aiResult.riskScore,
      risks: aiResult.risks,
      cached: false,
      _fallback: aiResult._fallback || false,
    });
  } catch (err) {
    console.error("[/analyze] Unhandled error:", err);
    return res.status(500).json({
      error: "Analysis failed",
      details: err.message,
    });
  }
});

// ─── GET /analyze/:documentId ─────────────────────────────────────────────────
// Retrieve cached analysis for a document (avoids re-calling AI)
router.get("/analyze/:documentId", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.analysisId) {
      return res
        .status(404)
        .json({ error: "No analysis found for this document" });
    }

    const analysis = await Analysis.findById(doc.analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis record not found" });
    }

    return res.status(200).json({
      documentId: doc._id,
      analysisId: analysis._id,
      fileName: doc.fileName,
      summary: analysis.summary,
      riskScore: analysis.riskScore,
      risks: analysis.risks,
      cached: true,
      createdAt: analysis.createdAt,
    });
  } catch (err) {
    console.error("[GET /analyze] Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /history/:userId ─────────────────────────────────────────────────────
// Returns all analyzed documents for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const docs = await Document.find({
      userId: req.params.userId,
      analysisId: { $ne: null },
    })
      .sort({ uploadDate: -1 })
      .select("fileName uploadDate analysisId fileSize");

    const results = await Promise.all(
      docs.map(async (doc) => {
        const analysis = await Analysis.findById(doc.analysisId).select(
          "riskScore createdAt"
        );
        return {
          documentId: doc._id,
          analysisId: doc.analysisId,
          fileName: doc.fileName,
          uploadDate: doc.uploadDate,
          riskScore: analysis?.riskScore || "UNKNOWN",
        };
      })
    );

    return res.status(200).json({ history: results });
  } catch (err) {
    console.error("[GET /history] Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /chat ───────────────────────────────────────────────────────────────
// Body: { question: string, documentId: string }
// Returns: { answer: string }
router.post("/chat", async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !documentId) {
      return res
        .status(400)
        .json({ error: "Both 'question' and 'documentId' are required" });
    }

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.extractedText) {
      return res
        .status(422)
        .json({ error: "No document text available for chat" });
    }

    const answer = await chatWithDocument(question, doc.extractedText);

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("[/chat] Error:", err);
    return res
      .status(500)
      .json({ error: "Chat failed", details: err.message });
  }
});

module.exports = router;
