import { Info, Target, Zap, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif", color: "#0f172a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", justifyContent: "center" }}>
        <Info size={32} color="#3b82f6" />
        <h1 style={{ fontSize: "36px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>About ClauseWise</h1>
      </div>

      <p style={{ fontSize: "18px", color: "#64748b", lineHeight: "1.6", textAlign: "center", marginBottom: "48px" }}>
        ClauseWise is an AI-powered contract intelligence platform designed to simplify legal documents and protect you from hidden risks. We believe legal clarity should be accessible to everyone, not just lawyers.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ background: "#eff6ff", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Target size={24} color="#3b82f6" />
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700" }}>Our Mission</h3>
            <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6" }}>To democratize legal understanding by transforming dense, complex contracts into plain-language summaries with clear risk surface maps.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ background: "#fdf4ff", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={24} color="#d946ef" />
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700" }}>Fast & Intelligent</h3>
            <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6" }}>Powered by state-of-the-art LLMs, ClauseWise reads your documents in seconds, extracting key clauses and scoring the overall risk level instantly.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ background: "#f0fdf4", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={24} color="#22c55e" />
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700" }}>Secure & Private</h3>
            <p style={{ margin: 0, color: "#64748b", lineHeight: "1.6" }}>We take your privacy seriously. Your uploaded documents are encrypted, securely analyzed, and only accessible to your authenticated account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
