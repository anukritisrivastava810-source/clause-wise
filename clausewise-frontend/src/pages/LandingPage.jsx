import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
      background: "#f8fafc",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <h1 style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a", marginBottom: "16px", letterSpacing: "-1px" }}>
        Contract Intelligence, <span style={{ color: "#3b82f6" }}>Simplified</span>.
      </h1>
      <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", lineHeight: "1.6", marginBottom: "40px" }}>
        ClauseWise breaks down complex legal documents into plain English summaries, maps your risk surface, and highlights dangerous clauses instantly.
      </p>
      <div style={{ display: "flex", gap: "16px" }}>
        <Link to="/auth" style={{
          background: "#0f172a",
          color: "#fff",
          textDecoration: "none",
          padding: "14px 32px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px"
        }}>
          Get Started
        </Link>
        <Link to="/about" style={{
          background: "#fff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          textDecoration: "none",
          padding: "14px 32px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px"
        }}>
          Learn More
        </Link>
      </div>
    </div>
  );
}
