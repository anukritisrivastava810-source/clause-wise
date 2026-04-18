import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    // In a full integration, you would POST to /auth/login or /auth/register
    // For now we simulate success and route to the dashboard
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>
          {isLogin ? "Welcome Back to ClauseWise" : "Create an Account"}
        </h2>
        <p style={{ color: "#64748b", textAlign: "center", marginBottom: "32px", fontSize: "14px" }}>
          {isLogin ? "Enter your credentials to access your dashboard" : "Sign up to start analyzing contracts"}
        </p>

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} 
          />
          <button type="submit" style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            padding: "14px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "8px"
          }}>
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "14px" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer", marginLeft: "4px" }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
