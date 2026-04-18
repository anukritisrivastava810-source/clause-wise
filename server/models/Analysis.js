// server/models/Analysis.js
// Mongoose schema for storing AI analysis results

const mongoose = require("mongoose");

const RiskClauseSchema = new mongoose.Schema(
  {
    clause: { type: String, required: true },
    level: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    summary: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Summary must have at least one point",
      },
    },
    riskScore: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    risks: {
      type: [RiskClauseSchema],
      default: [],
    },
    _fallback: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Analysis", AnalysisSchema);
