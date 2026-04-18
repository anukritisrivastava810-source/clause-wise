import { useNavigate } from "react-router-dom";
import { User, LogOut, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement token clearing logic here
    navigate("/auth");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "32px", color: "#0f172a" }}>Profile Settings</h1>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ width: "80px", height: "80px", background: "#3b82f6", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700" }}>
            JD
          </div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>Jane Doe</h2>
            <p style={{ margin: 0, color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={14} /> jane.doe@example.com
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}><User size={16} /> Account Role</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>Pro User</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={16} /> Member Since</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>April 2024</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ width: "100%", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "14px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
