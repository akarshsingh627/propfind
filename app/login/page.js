"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const N = {
  navy900: "#050D1F", navy700: "#0F2040", navy600: "#162B55",
  navy500: "#1E3A6E", gold: "#C9963A", goldLight: "#E8B84B",
  offWhite: "#F5F7FC", border: "#E0E6F2", muted: "#6B82A8", text: "#0A1628",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter',sans-serif; background:${N.offWhite}; color:${N.text}; -webkit-font-smoothing:antialiased; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .fu { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
  .fu2 { animation:fadeUp .45s .08s cubic-bezier(.22,1,.36,1) both; }
  .btn { background:${N.navy500}; color:#fff; border:none; border-radius:12px; padding:14px; font-size:15px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:background .18s,transform .14s; width:100%; }
  .btn:hover { background:${N.navy600}; transform:translateY(-1px); }
  .btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .btn-gold { background:linear-gradient(135deg,${N.gold},${N.goldLight}); color:#fff; }
  .btn-gold:hover { background:linear-gradient(135deg,#B8832A,${N.gold}); }
  .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; margin-right:8px; vertical-align:middle; }
  input { font-family:'Inter',sans-serif; }
  input::placeholder { color:#B0BCCC; }
`;

function Input({ label, type = "text", placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", border: `1.5px solid ${focused ? N.navy500 : N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border .18s", color: N.text, background: "#fff" }} />
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login"); // login or signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/admin";
    });
  }, []);

  async function handleLogin() {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError("Invalid email or password. Please try again."); return; }
    window.location.href = "/admin";
  }

  async function handleSignup() {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess("Account created! Check your email to confirm, then log in.");
    setMode("login");
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg,${N.navy900} 0%,${N.navy600} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(201,150,58,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,0.04) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle,rgba(201,150,58,0.1) 0%,transparent 70%)" }} />

      <div className="fu" style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(5,13,31,0.4)", overflow: "hidden", position: "relative" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${N.navy900},${N.navy500},${N.gold})` }} />
        <div style={{ padding: "36px 36px 40px" }}>
          {/* Logo */}
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: N.navy900 }}>P</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: N.text }}>PropFind</span>
          </a>

          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: N.text, marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div style={{ fontSize: 14, color: N.muted, marginBottom: 28 }}>
            {mode === "login" ? "Sign in to access the admin panel" : "Set up your admin account"}
          </div>

          {success && (
            <div style={{ background: "#E0F5EE", border: "1px solid #B6E8CC", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#0A5C38", marginBottom: 20, fontWeight: 500 }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{ background: "#FFF5F5", border: "1px solid #FFC0C0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#E53E3E", marginBottom: 20, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />

          <button onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}
            className="btn btn-gold" style={{ marginTop: 8, fontSize: 15, padding: 15 }}>
            {loading ? <><span className="spinner" />{mode === "login" ? "Signing in…" : "Creating account…"}</> : mode === "login" ? "Sign in →" : "Create account →"}
          </button>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: N.muted }}>
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: N.navy500, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 13 }}>Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: N.navy500, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 13 }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}