import { Link } from "react-router-dom";
import { FileUp, ShieldAlert, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif", color: "#0f172a" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Welcome to ClauseWise</h1>
      <p style={{ color: "#64748b", marginBottom: "40px" }}>Analyze your legal documents to instantly uncover hidden risks.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        
        {/* Upload Action Card */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ background: "#eff6ff", color: "#3b82f6", padding: "16px", borderRadius: "50%", marginBottom: "16px" }}>
            <FileUp size={32} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>New Analysis</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Upload a new contract (PDF, DOCX) to get a full risk breakdown and summary.</p>
          <Link to="/analyze" style={{ background: "#3b82f6", color: "#fff", textDecoration: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", width: "100%", boxSizing: "border-box" }}>
            Analyze New Document
          </Link>
        </div>

        {/* Info Cards */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><ShieldAlert size={20} color="#f59e0b" /> Real-World Risk Example</h2>
          <div style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b", padding: "16px", borderRadius: "4px" }}>
            <p style={{ fontWeight: "600", margin: "0 0 8px", fontSize: "14px", color: "#b45309" }}>Automatic Renewal Clause</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#78350f" }}>"This Agreement shall automatically renew for successive terms equal to the Initial Term unless either Party provides written notice of non-renewal at least 90 days prior to the expiration."</p>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={20} color="#22c55e" /> Recent Activity</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>You haven't uploaded any documents recently.</p>
          <Link to="/history" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: "600", marginTop: "16px", display: "inline-block" }}>View full history &rarr;</Link>
        </div>

      </div>
    </div>
  );
}
