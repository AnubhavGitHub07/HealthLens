import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User, ArrowRight, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPage.css";

interface AuthPageProps {
  mode?: "login" | "signup" | "forgot-password" | "reset-password";
}

export default function AuthPage({ mode = "login" }: AuthPageProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetLink, setResetLink] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();

  useEffect(() => {
    setCurrentMode(mode);
    setError("");
    setSuccessMsg("");
    setResetLink("");
    setName("");
    setEmail("");
    setPassword("");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResetLink("");

    if (currentMode === "forgot-password") {
      if (!email) return setError("Please enter your email");
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:5001/api/auth/forgot-password", { email });
        if (res.data.success) {
          setSuccessMsg("Password reset requested successfully!");
          if (res.data.resetLink) setResetLink(res.data.resetLink);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error processing request");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentMode === "reset-password") {
      if (!password || password.length < 6) return setError("Password must be at least 6 characters");
      try {
        setLoading(true);
        const res = await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, { password });
        if (res.data.success) {
          setSuccessMsg("Password reset successful! You can now log in.");
          setPassword("");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error resetting password");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login or Signup functionality
    if (!email || !password || (currentMode === "signup" && !name)) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const endpoint = currentMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = currentMode === "login"
        ? { email, password }
        : { name, email, password };

      const res = await axios.post(`http://localhost:5001${endpoint}`, payload);

      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Authentication failed");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof axios.AxiosError ? err.response?.data?.message : err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (currentMode === "login") navigate("/signup");
    else navigate("/login");
  };

  // UI Setup depending on mode
  let title = "Welcome Back";
  let subtitle = "Sign in to access your health dashboard";
  let btnText = "Sign In";

  if (currentMode === "signup") {
    title = "Create Account";
    subtitle = "Start your health tracking journey today";
    btnText = "Create Account";
  } else if (currentMode === "forgot-password") {
    title = "Reset Password";
    subtitle = "Enter your email to receive a reset link";
    btnText = "Send Reset Link";
  } else if (currentMode === "reset-password") {
    title = "New Password";
    subtitle = "Enter a new secured password for your account";
    btnText = "Update Password";
  }

  return (
    <div className="auth-page">
      {/* Left — Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Heart size={24} />
            </div>
            <span className="auth-logo-text">HealthLens</span>
          </div>

          <div className="auth-tagline">
            <h1>
              Your AI-Powered
              <br />
              <span>Health Assistant</span>
            </h1>
            <p>
              Track, analyze, and improve your health over time with intelligent
              medical report analysis powered by Google Gemini.
            </p>
          </div>

          <div className="auth-trust-strip">
            <div className="trust-item">
              <span className="trust-value">10K+</span>
              <span className="trust-label">Reports Analyzed</span>
            </div>
            <div className="trust-item">
              <span className="trust-value">98%</span>
              <span className="trust-label">Accuracy</span>
            </div>
            <div className="trust-item">
              <span className="trust-value">24/7</span>
              <span className="trust-label">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="auth-success">
              <CheckCircle size={16} />
              <div>
                {successMsg}
                {resetLink && (
                  <div style={{ marginTop: 8 }}>
                    <a href={resetLink} style={{ color: "#14b8a6", fontWeight: "bold" }}>Click here to reset (Dev Link)</a>
                  </div>
                )}
                {currentMode === "reset-password" && (
                  <div style={{ marginTop: 8 }}>
                    <Link to="/login" style={{ color: "#14b8a6", fontWeight: "bold" }}>Back to Login</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {currentMode === "signup" && (
              <div className="auth-field">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(currentMode === "login" || currentMode === "signup" || currentMode === "forgot-password") && (
              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(currentMode === "login" || currentMode === "signup" || currentMode === "reset-password") && (
              <div className="auth-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>{currentMode === "reset-password" ? "New Password" : "Password"}</label>
                  {currentMode === "login" && (
                    <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "#14b8a6", textDecoration: "none", fontWeight: 600 }}>Forgot password?</Link>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder={currentMode === "reset-password" ? "Min 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn-spinner" />
              ) : (
                <>
                  {btnText}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {(currentMode === "login" || currentMode === "signup") && (
            <div className="auth-toggle">
              {currentMode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button className="auth-toggle-btn" onClick={toggleMode}>
                {currentMode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          )}

          {currentMode === "forgot-password" && (
            <div className="auth-toggle" style={{ marginTop: 24 }}>
              Remember your password?{" "}
              <Link to="/login" className="auth-toggle-btn" style={{ textDecoration: "none" }}>Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
