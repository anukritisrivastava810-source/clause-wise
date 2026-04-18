// server/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    extractedText: { type: String },
    uploadDate: { type: Date, default: Date.now },
    // Reference to cached analysis (avoids re-calling AI)
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
