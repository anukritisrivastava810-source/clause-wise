// client/src/pages/AnalysisPage.jsx
// ClauseWise — Split-screen Analysis Page
// Connects to /analyze API, renders results with highlighting + AI chat

import { useState, useRef, useEffect, useCallback } from "react";
import { uploadDocument, analyzeText, chatWithDocument } from "../services/api";

// ─── Risk color helpers ───────────────────────────────────────────────────────
const RISK_COLORS = {
  HIGH: { bg: "#ff4444", light: "#fff0f0", border: "#ff4444", dot: "#ff4444" },
  MEDIUM: {
    bg: "#f59e0b",
    light: "#fffbeb",
    border: "#f59e0b",
    dot: "#f59e0b",
  },
  LOW: { bg: "#22c55e", light: "#f0fdf4", border: "#22c55e", dot: "#22c55e" },
};

const SCORE_CONFIG = {
  HIGH: { label: "High Risk", color: "#ff4444", arc: 0.85 },
  MEDIUM: { label: "Medium Risk", color: "#f59e0b", arc: 0.55 },
  LOW: { label: "Low Risk", color: "#22c55e", arc: 0.25 },
};

// ─── RiskScoreGauge ───────────────────────────────────────────────────────────
function RiskScoreGauge({ score }) {
  const config = SCORE_CONFIG[score] || SCORE_CONFIG.MEDIUM;
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * r; // semicircle
  const dashOffset = circumference * (1 - config.arc);

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <svg width="140" height="90" viewBox="0 0 140 90">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={config.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill={config.color}
          fontFamily="'DM Mono', monospace"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="9"
          fill="#6b7280"
          fontFamily="'DM Sans', sans-serif"
        >
          RISK SCORE
        </text>
      </svg>
    </div>
  );
}

// ─── HighlightedDocument ──────────────────────────────────────────────────────
function HighlightedDocument({ text, risks, activeClause }) {
  if (!text) return null;

  // Build highlighted HTML by finding and wrapping risk clauses
  let html = text;
  const sorted = [...risks].sort(
    (a, b) => b.clause.length - a.clause.length // longest first to avoid partial matches
  );

  sorted.forEach((risk) => {
    const colors = RISK_COLORS[risk.level] || RISK_COLORS.MEDIUM;
    const escaped = risk.clause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const regex = new RegExp(`(${escaped})`, "gi");
      const isActive = activeClause === risk.clause;
      html = html.replace(
        regex,
        `<mark data-level="${risk.level}" style="background:${colors.light};border-bottom:2px solid ${colors.border};padding:1px 2px;border-radius:2px;cursor:pointer;${isActive ? `outline:2px solid ${colors.border};` : ""}">$1</mark>`
      );
    } catch {
      // Skip clauses with regex issues
    }
  });

  // Preserve line breaks
  html = html.replace(/\n/g, "<br/>");

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        lineHeight: "1.8",
        color: "#374151",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Main AnalysisPage ────────────────────────────────────────────────────────
export default function AnalysisPage({ userId = "demo-user" }) {
  const [phase, setPhase] = useState("upload"); // upload | analyzing | results
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [docText, setDocText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [error, setError] = useState(null);
  const [activeClause, setActiveClause] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setFileName(file.name);
      setError(null);
      setPhase("analyzing");
      setUploadProgress(0);

      // Read file text for local display
      const reader = new FileReader();
      reader.onload = (e) => setDocText(e.target.result || "");
      reader.readAsText(file);

      try {
        // Step 1: Upload and get extracted text
        const extractResult = await uploadDocument(file, setUploadProgress);
        
        // Step 2: Send text to AI
        const result = await analyzeText(extractResult, userId);
        
        setAnalysis(result);
        setDocumentId(result.documentId);
        setPhase("results");
      } catch (err) {
        setError(err.message);
        setPhase("upload");
      }
    },
    [userId]
  );

  const onFileInput = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !documentId || chatLoading) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const { answer } = await chatWithDocument(q, documentId);
      setChatMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const riskCounts = analysis
    ? {
        HIGH: analysis.risks.filter((r) => r.level === "HIGH").length,
        MEDIUM: analysis.risks.filter((r) => r.level === "MEDIUM").length,
        LOW: analysis.risks.filter((r) => r.level === "LOW").length,
      }
    : {};

  return (
    <div style={styles.root}>
      {/* ── Navbar ── */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>⚖</span>
          <span style={styles.navTitle}>ClauseWise</span>
        </div>
        <div style={styles.navLinks}>
          {["Dashboard", "Analyze", "History"].map((item) => (
            <span
              key={item}
              style={{
                ...styles.navLink,
                ...(item === "Analyze" ? styles.navLinkActive : {}),
              }}
            >
              {item}
            </span>
          ))}
        </div>
        <div style={styles.navAvatar}>AK</div>
      </nav>

      {/* ── UPLOAD PHASE ── */}
      {phase === "upload" && (
        <div style={styles.uploadWrapper}>
          <div style={styles.uploadHero}>
            <h1 style={styles.heroTitle}>Contract Intelligence</h1>
            <p style={styles.heroSub}>
              Upload any legal document. Get instant risk analysis, plain
              English summaries, and highlighted clauses.
            </p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠ {error}</span>
            </div>
          )}

          <div
            style={{
              ...styles.dropzone,
              ...(dragOver ? styles.dropzoneActive : {}),
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={styles.dropIcon}>📄</div>
            <p style={styles.dropTitle}>Drop your contract here</p>
            <p style={styles.dropSub}>PDF, DOCX, or TXT · Max 10MB</p>
            <button style={styles.dropBtn}>Choose File</button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={onFileInput}
            />
          </div>

          {/* Risk legend */}
          <div style={styles.legend}>
            {[
              { level: "HIGH", label: "High Risk — One-sided or dangerous clauses" },
              { level: "MEDIUM", label: "Medium Risk — Review recommended" },
              { level: "LOW", label: "Low Risk — Standard language" },
            ].map(({ level, label }) => (
              <div key={level} style={styles.legendItem}>
                <span
                  style={{
                    ...styles.legendDot,
                    background: RISK_COLORS[level].dot,
                  }}
                />
                <span style={styles.legendText}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANALYZING PHASE ── */}
      {phase === "analyzing" && (
        <div style={styles.analyzingWrapper}>
          <div style={styles.analyzingCard}>
            <div style={styles.spinner} />
            <h2 style={styles.analyzingTitle}>Analyzing Document</h2>
            <p style={styles.analyzingFile}>{fileName}</p>
            <div style={styles.progressBar}>
              <div
                style={{ ...styles.progressFill, width: `${uploadProgress}%` }}
              />
            </div>
            <p style={styles.analyzingSteps}>
              {uploadProgress < 40
                ? "Uploading document..."
                : uploadProgress < 80
                ? "Extracting text..."
                : "Running AI analysis..."}
            </p>
          </div>
        </div>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === "results" && analysis && (
        <div style={styles.resultsWrapper}>
          {/* Header bar */}
          <div style={styles.resultsHeader}>
            <div>
              <span style={styles.fileTag}>📄 {fileName}</span>
            </div>
            <div style={styles.riskBadges}>
              {Object.entries(riskCounts).map(([level, count]) => (
                <span
                  key={level}
                  style={{
                    ...styles.riskBadge,
                    background: RISK_COLORS[level].light,
                    color: RISK_COLORS[level].dot,
                    border: `1px solid ${RISK_COLORS[level].border}`,
                  }}
                >
                  {count} {level}
                </span>
              ))}
            </div>
            <button
              style={styles.newDocBtn}
              onClick={() => {
                setPhase("upload");
                setAnalysis(null);
                setDocText("");
                setChatMessages([]);
                setChatOpen(false);
              }}
            >
              + New Document
            </button>
          </div>

          {/* Split screen */}
          <div style={styles.splitScreen}>
            {/* LEFT — Document viewer */}
            <div style={styles.leftPanel}>
              <div style={styles.panelHeader}>
                <span style={styles.panelTitle}>Document</span>
                <div style={styles.highlightLegend}>
                  {["HIGH", "MEDIUM", "LOW"].map((l) => (
                    <span key={l} style={styles.hlItem}>
                      <span
                        style={{
                          ...styles.hlDot,
                          background: RISK_COLORS[l].dot,
                        }}
                      />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={styles.docScrollArea}>
                {docText ? (
                  <HighlightedDocument
                    text={docText}
                    risks={analysis.risks}
                    activeClause={activeClause}
                  />
                ) : (
                  <div style={styles.docPlaceholder}>
                    <p>Document preview not available.</p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Text was extracted server-side for analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Analysis panel */}
            <div style={styles.rightPanel}>
              {/* Risk Score Gauge */}
              <div style={styles.card}>
                <RiskScoreGauge score={analysis.riskScore} />
                <div style={styles.scoreBreakdown}>
                  {Object.entries(riskCounts).map(([level, count]) => (
                    <div key={level} style={styles.breakdownRow}>
                      <span
                        style={{
                          ...styles.breakdownDot,
                          background: RISK_COLORS[level].dot,
                        }}
                      />
                      <span style={styles.breakdownLabel}>{level}</span>
                      <span style={styles.breakdownCount}>{count} clause{count !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📋 Summary</h3>
                <ul style={styles.summaryList}>
                  {analysis.summary.map((point, i) => (
                    <li key={i} style={styles.summaryItem}>
                      <span style={styles.summaryBullet}>›</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Surface Map */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🗺 Risk Surface Map</h3>
                <div style={styles.riskList}>
                  {analysis.risks.map((risk, i) => {
                    const c = RISK_COLORS[risk.level];
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.riskCard,
                          borderLeft: `4px solid ${c.border}`,
                          background:
                            activeClause === risk.clause ? c.light : "#fff",
                        }}
                        onClick={() =>
                          setActiveClause(
                            activeClause === risk.clause ? null : risk.clause
                          )
                        }
                      >
                        <div style={styles.riskCardHeader}>
                          <span
                            style={{
                              ...styles.riskLevelBadge,
                              background: c.light,
                              color: c.dot,
                            }}
                          >
                            {risk.level}
                          </span>
                        </div>
                        <p style={styles.riskClause}>"{risk.clause}"</p>
                        <p style={styles.riskExplanation}>{risk.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Chat toggle */}
              <div style={styles.card}>
                <div style={styles.chatHeader}>
                  <h3 style={styles.cardTitle}>💬 Ask AI</h3>
                  <button
                    style={styles.chatToggle}
                    onClick={() => setChatOpen(!chatOpen)}
                  >
                    {chatOpen ? "Collapse ▲" : "Expand ▼"}
                  </button>
                </div>
                {chatOpen && (
                  <div>
                    <div style={styles.chatMessages}>
                      {chatMessages.length === 0 && (
                        <p style={styles.chatPlaceholder}>
                          Ask a question about your document…
                        </p>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.chatMsg,
                            ...(msg.role === "user"
                              ? styles.chatUser
                              : styles.chatAI),
                          }}
                        >
                          {msg.text}
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ ...styles.chatMsg, ...styles.chatAI }}>
                          <span style={styles.typingDots}>●●●</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={styles.chatInputRow}>
                      <input
                        style={styles.chatInput}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChat()}
                        placeholder="e.g. What are my termination rights?"
                        disabled={chatLoading}
                      />
                      <button
                        style={{
                          ...styles.chatSend,
                          opacity: chatLoading ? 0.5 : 1,
                        }}
                        onClick={sendChat}
                        disabled={chatLoading}
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    height: "60px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    gap: "24px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "8px", flex: 1 },
  navLogo: { fontSize: "20px" },
  navTitle: {
    color: "#f1f5f9",
    fontWeight: "700",
    fontSize: "18px",
    letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", gap: "8px" },
  navLink: {
    color: "#94a3b8",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  navLinkActive: {
    color: "#f1f5f9",
    background: "#1e293b",
    fontWeight: "600",
  },
  navAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  // Upload
  uploadWrapper: {
    maxWidth: "640px",
    margin: "60px auto",
    padding: "0 24px",
  },
  uploadHero: { textAlign: "center", marginBottom: "40px" },
  heroTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-1px",
    margin: "0 0 12px",
  },
  heroSub: { fontSize: "16px", color: "#64748b", lineHeight: "1.6", margin: 0 },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#b91c1c",
    marginBottom: "16px",
    fontSize: "14px",
  },
  dropzone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#fff",
    padding: "48px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dropzoneActive: {
    border: "2px dashed #3b82f6",
    background: "#eff6ff",
  },
  dropIcon: { fontSize: "48px", marginBottom: "16px" },
  dropTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px",
  },
  dropSub: { color: "#94a3b8", fontSize: "14px", margin: "0 0 24px" },
  dropBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  legend: {
    marginTop: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "10px" },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendText: { fontSize: "14px", color: "#64748b" },
  // Analyzing
  analyzingWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 60px)",
  },
  analyzingCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "48px",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    maxWidth: "400px",
    width: "90%",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 24px",
  },
  analyzingTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px",
  },
  analyzingFile: { color: "#64748b", fontSize: "14px", margin: "0 0 24px" },
  progressBar: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "99px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: "99px",
    transition: "width 0.3s ease",
  },
  analyzingSteps: { color: "#94a3b8", fontSize: "13px", margin: 0 },
  // Results
  resultsWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 60px)",
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 24px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  fileTag: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "6px",
  },
  riskBadges: { display: "flex", gap: "8px", flex: 1 },
  riskBadge: {
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "700",
  },
  newDocBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "auto",
  },
  splitScreen: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    gap: 0,
  },
  leftPanel: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e2e8f0",
    background: "#fff",
    minWidth: 0,
  },
  rightPanel: {
    flex: "1 1 50%",
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: "#f8fafc",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  panelTitle: { fontWeight: "700", fontSize: "14px", color: "#0f172a" },
  highlightLegend: { display: "flex", gap: "12px" },
  hlItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#64748b",
  },
  hlDot: { width: "8px", height: "8px", borderRadius: "50%" },
  docScrollArea: { overflowY: "auto", flex: 1 },
  docPlaceholder: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  // Cards
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 14px",
  },
  scoreBreakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "14px",
  },
  breakdownRow: { display: "flex", alignItems: "center", gap: "8px" },
  breakdownDot: { width: "8px", height: "8px", borderRadius: "50%" },
  breakdownLabel: { fontSize: "12px", fontWeight: "700", color: "#374151", width: "60px" },
  breakdownCount: { fontSize: "12px", color: "#6b7280" },
  summaryList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" },
  summaryItem: { display: "flex", gap: "8px", fontSize: "13px", color: "#374151", lineHeight: "1.5" },
  summaryBullet: { color: "#3b82f6", fontWeight: "700", flexShrink: 0, marginTop: "1px" },
  riskList: { display: "flex", flexDirection: "column", gap: "10px" },
  riskCard: {
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  riskCardHeader: { display: "flex", justifyContent: "flex-end", marginBottom: "6px" },
  riskLevelBadge: {
    fontSize: "10px",
    fontWeight: "800",
    padding: "2px 8px",
    borderRadius: "99px",
    letterSpacing: "0.5px",
  },
  riskClause: {
    fontSize: "12px",
    fontStyle: "italic",
    color: "#374151",
    margin: "0 0 6px",
    lineHeight: "1.5",
  },
  riskExplanation: { fontSize: "12px", color: "#6b7280", margin: 0, lineHeight: "1.5" },
  // Chat
  chatHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  chatToggle: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "11px",
    cursor: "pointer",
    color: "#64748b",
  },
  chatMessages: {
    maxHeight: "240px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
    padding: "4px 0",
  },
  chatPlaceholder: { fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "16px 0", margin: 0 },
  chatMsg: {
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.5",
    maxWidth: "85%",
  },
  chatUser: {
    background: "#0f172a",
    color: "#fff",
    alignSelf: "flex-end",
    borderBottomRightRadius: "4px",
  },
  chatAI: {
    background: "#f1f5f9",
    color: "#374151",
    alignSelf: "flex-start",
    borderBottomLeftRadius: "4px",
  },
  typingDots: { letterSpacing: "2px", color: "#94a3b8" },
  chatInputRow: { display: "flex", gap: "8px" },
  chatInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  chatSend: {
    width: "36px",
    height: "36px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
