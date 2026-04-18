import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch from /history/:userId
    // Mocking an empty/sample history state
    setTimeout(() => {
      setHistory([
        { id: "1", fileName: "NDA_AcmeCorp_2024.pdf", date: "Oct 12, 2024", riskScore: "MEDIUM" },
        { id: "2", fileName: "Employment_Agreement.docx", date: "Sep 28, 2024", riskScore: "LOW" },
        { id: "3", fileName: "Vendor_Contract_V2.pdf", date: "Sep 15, 2024", riskScore: "HIGH" }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getRiskColor = (score) => {
    switch(score) {
      case "HIGH": return { bg: "#fff0f0", color: "#ef4444", border: "#fca5a5" };
      case "MEDIUM": return { bg: "#fffbeb", color: "#f59e0b", border: "#fcd34d" };
      case "LOW": return { bg: "#f0fdf4", color: "#22c55e", border: "#86efac" };
      default: return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Clock size={28} />
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Analysis History</h1>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "16px 24px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Document Name</th>
                <th style={{ padding: "16px 24px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Date Analyzed</th>
                <th style={{ padding: "16px 24px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Risk Score</th>
                <th style={{ padding: "16px 24px", color: "#64748b", fontWeight: "600", fontSize: "14px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((doc) => {
                const colors = getRiskColor(doc.riskScore);
                return (
                  <tr key={doc.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "16px 24px", fontWeight: "500", color: "#0f172a" }}>{doc.fileName}</td>
                    <td style={{ padding: "16px 24px", color: "#64748b", fontSize: "14px" }}>{doc.date}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "700" }}>
                        {doc.riskScore}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button style={{ background: "#f1f5f9", color: "#0f172a", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                        View Analysis
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
