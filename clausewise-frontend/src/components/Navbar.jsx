import { Link, useLocation } from "react-router-dom";
import { Home, FileSearch, Clock, Info, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const getLinkStyle = (targetPath) => {
    const isActive = path === targetPath;
    return {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isActive ? "#f1f5f9" : "#94a3b8",
      background: isActive ? "#1e293b" : "transparent",
      padding: "8px 16px",
      borderRadius: "6px",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: isActive ? "600" : "500",
      transition: "all 0.2s",
    };
  };

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "64px",
      background: "#0f172a",
      borderBottom: "1px solid #1e293b",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>⚖</span>
          <span style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.5px" }}>
            ClauseWise
          </span>
        </Link>
        <div style={{ display: "flex", gap: "4px" }}>
          <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
            <Home size={16} /> Dashboard
          </Link>
          <Link to="/analyze" style={getLinkStyle("/analyze")}>
            <FileSearch size={16} /> Analyze
          </Link>
          <Link to="/history" style={getLinkStyle("/history")}>
            <Clock size={16} /> History
          </Link>
          <Link to="/about" style={getLinkStyle("/about")}>
            <Info size={16} /> About
          </Link>
        </div>
      </div>
      <div>
        <Link to="/profile" style={getLinkStyle("/profile")}>
          <User size={16} /> Profile
        </Link>
      </div>
    </nav>
  );
}
