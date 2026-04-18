const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are supported"), false);
    }
  },
});

async function extractText(file) {
  const { mimetype, buffer } = file;

  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  // Fallback as requested
  return buffer.toString();
}

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(file);

    res.json({ text, fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype });
  } catch (err) {
    console.error("[/upload] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
