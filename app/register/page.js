"use client";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const N = {
  navy900: "#050D1F", navy700: "#0F2040", navy600: "#162B55",
  navy500: "#1E3A6E", gold: "#C9963A", goldLight: "#E8B84B",
  goldPale: "#FDF3DC", offWhite: "#F5F7FC", border: "#E0E6F2",
  muted: "#6B82A8", text: "#0A1628",
};

const AREAS = ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Alambagh", "Chinhat"];
const TAGS = ["Residential", "Commercial", "Flats", "Houses", "Shops", "Plots", "Office spaces", "PG/Hostels"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter',sans-serif; background:${N.offWhite}; color:${N.text}; -webkit-font-smoothing:antialiased; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .fu { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
  .fu2 { animation:fadeUp .45s .08s cubic-bezier(.22,1,.36,1) both; }
  .fu3 { animation:fadeUp .45s .16s cubic-bezier(.22,1,.36,1) both; }
  .btn { background:${N.navy500}; color:#fff; border:none; border-radius:12px; padding:14px 30px; font-size:15px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:background .18s,transform .14s; width:100%; }
  .btn:hover { background:${N.navy600}; transform:translateY(-1px); }
  .btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .btn-gold { background:linear-gradient(135deg,${N.gold},${N.goldLight}); }
  .btn-gold:hover { background:linear-gradient(135deg,#B8832A,${N.gold}); }
  .tag-btn { padding:8px 16px; border-radius:30px; border:1.5px solid ${N.border}; font-size:13px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:all .18s; background:#fff; color:${N.muted}; }
  .tag-btn:hover { border-color:${N.navy500}; color:${N.navy500}; }
  .tag-btn.on { background:${N.navy500}; color:#fff; border-color:${N.navy500}; }
  .spinner { width:20px; height:20px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; margin-right:8px; vertical-align:middle; }
  input,select,textarea { font-family:'Inter',sans-serif; }
  input::placeholder,textarea::placeholder { color:#B0BCCC; }
`;

function Label({ children }) {
  return <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7, letterSpacing: ".02em" }}>{children}</label>;
}

function Input({ type = "text", placeholder, value, onChange, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width: "100%", border: `1.5px solid ${focused ? N.navy500 : N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border .18s", color: N.text, background: "#fff" }} />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", color: N.text }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [form, setForm] = useState({
    name: "", phone: "", experience: "1-3 years", since: "",
    about: "", initials: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Auto generate initials from name
  useEffect(() => {
    const words = form.name.trim().split(" ").filter(Boolean);
    if (words.length >= 2) set("initials", (words[0][0] + words[1][0]).toUpperCase());
    else if (words.length === 1) set("initials", words[0].slice(0, 2).toUpperCase());
  }, [form.name]);

  function toggleArea(area) {
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function validateStep1() {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.phone.trim() || form.phone.length < 10) return "Please enter a valid phone number.";
    return "";
  }

  function validateStep2() {
    if (selectedAreas.length === 0) return "Please select at least one area.";
    if (selectedTags.length === 0) return "Please select at least one specialisation.";
    if (!form.since.trim()) return "Please enter the year you started.";
    return "";
  }

  async function submit() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");
    const { error: dbErr } = await supabase.from("agents").insert([{
      name: form.name.trim(),
      initials: form.initials,
      phone: form.phone.trim(),
      areas: selectedAreas,
      tags: selectedTags,
      experience: form.experience,
      since: form.since.trim(),
      about: form.about.trim(),
      verified: false,
      status: "pending",
      rating: 0,
      reviews: 0,
      listings: 0,
      rent: 0,
      sale: 0,
    }]);
    setSaving(false);
    if (dbErr) { setError("Something went wrong. Please try again."); return; }
    setDone(true);
  }

  function goNext() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  }

  if (done) return (
    <div style={{ minHeight: "100vh", background: N.offWhite, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fu" style={{ background: "#fff", borderRadius: 24, padding: "56px 40px", maxWidth: 480, width: "100%", textAlign: "center", border: `1px solid ${N.border}`, boxShadow: "0 20px 60px rgba(10,22,40,0.1)" }}>
        <div style={{ width: 72, height: 72, background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30, boxShadow: "0 8px 28px rgba(201,150,58,0.35)" }}>✓</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: N.text, marginBottom: 12 }}>Application submitted!</div>
        <div style={{ fontSize: 15, color: N.muted, lineHeight: 1.8, marginBottom: 32 }}>
          Thank you <strong>{form.name.split(" ")[0]}</strong>! Your profile is under review.<br />
          We'll verify your details and activate your listing within <strong>24–48 hours</strong>.<br /><br />
          We'll contact you on <strong>{form.phone}</strong> once you're live.
        </div>
        <a href="/" style={{ display: "inline-block", background: N.navy500, color: "#fff", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 600, textDecoration: "none", fontFamily: "'Inter',sans-serif" }}>
          Back to PropFind →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: N.offWhite }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg,${N.navy900} 0%,${N.navy600} 100%)`, padding: "40px 24px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(201,150,58,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,0.04) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "radial-gradient(circle,rgba(201,150,58,0.1) 0%,transparent 70%)" }} />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: N.navy900 }}>P</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>PropFind</span>
          </a>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,150,58,0.12)", border: "1px solid rgba(201,150,58,0.25)", borderRadius: 30, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: N.goldLight, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Agent registration · Lucknow</span>
          </div>
          <h1 className="fu2" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,42px)", color: "#fff", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, letterSpacing: "-.02em" }}>
            Join PropFind as a<br />
            <span style={{ background: `linear-gradient(90deg,${N.gold},${N.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>verified agent</span>
          </h1>
          <p className="fu3" style={{ fontSize: 15, color: "#7DA0CC", lineHeight: 1.7 }}>
            Get discovered by property seekers across Lucknow. List your properties, build your reputation, and grow your business.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 560, margin: "-28px auto 0", padding: "0 24px 60px" }}>
        <div style={{ background: "#fff", borderRadius: 22, border: `1px solid ${N.border}`, boxShadow: "0 20px 60px rgba(10,22,40,0.09)", overflow: "hidden" }}>
          {/* Gold top bar */}
          <div style={{ height: 4, background: `linear-gradient(90deg,${N.navy900},${N.navy500},${N.gold})` }} />

          <div style={{ padding: "32px 32px 36px" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{ height: 4, borderRadius: 4, background: s <= step ? `linear-gradient(90deg,${N.navy500},${N.gold})` : N.border, transition: "background .3s", marginBottom: 6 }} />
                  <div style={{ fontSize: 11, color: s <= step ? N.navy500 : N.muted, fontWeight: 600 }}>
                    {s === 1 ? "Personal details" : "Professional details"}
                  </div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="fu">
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: N.text, marginBottom: 24 }}>Tell us about yourself</div>

                <div style={{ marginBottom: 18 }}>
                  <Label>Full name / Business name</Label>
                  <Input placeholder="e.g. Rakesh Verma Properties" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <Label>WhatsApp number</Label>
                  <Input type="tel" placeholder="e.g. 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <Label>Years of experience</Label>
                    <Select value={form.experience} onChange={e => set("experience", e.target.value)}
                      options={["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years", "15+ years"]} />
                  </div>
                  <div>
                    <Label>In business since (year)</Label>
                    <Input placeholder="e.g. 2015" value={form.since} onChange={e => set("since", e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Label>About you (optional)</Label>
                  <textarea placeholder="Describe your experience, what areas you cover, what makes you stand out…"
                    value={form.about} onChange={e => set("about", e.target.value)}
                    style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", minHeight: 100, resize: "vertical", boxSizing: "border-box", color: N.text, fontFamily: "'Inter',sans-serif" }} />
                </div>

                {error && <div style={{ color: "#E53E3E", fontSize: 13, marginBottom: 16, fontWeight: 500, background: "#FFF5F5", padding: "10px 14px", borderRadius: 8 }}>{error}</div>}

                <button onClick={goNext} className="btn btn-gold" style={{ fontSize: 15, padding: 15 }}>
                  Continue → Professional details
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="fu">
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: N.text, marginBottom: 24 }}>Your areas & specialisations</div>

                <div style={{ marginBottom: 22 }}>
                  <Label>Areas you operate in (select all that apply)</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {AREAS.map(a => (
                      <button key={a} onClick={() => toggleArea(a)} className={`tag-btn ${selectedAreas.includes(a) ? "on" : ""}`}>{a}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <Label>Specialisations (select all that apply)</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {TAGS.map(t => (
                      <button key={t} onClick={() => toggleTag(t)} className={`tag-btn ${selectedTags.includes(t) ? "on" : ""}`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                {form.name && (
                  <div style={{ background: N.offWhite, borderRadius: 14, border: `1px solid ${N.border}`, padding: "16px 18px", marginBottom: 22 }}>
                    <div style={{ fontSize: 11, color: N.muted, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Your profile preview</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#D6E4FF", color: N.navy500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>{form.initials || "??"}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: N.text, marginBottom: 2 }}>{form.name}</div>
                        <div style={{ fontSize: 12, color: N.muted }}>{selectedAreas.join(" · ") || "No areas selected"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {error && <div style={{ color: "#E53E3E", fontSize: 13, marginBottom: 16, fontWeight: 500, background: "#FFF5F5", padding: "10px 14px", borderRadius: 8 }}>{error}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setStep(1); setError(""); }} style={{ flex: 1, background: N.offWhite, border: `1px solid ${N.border}`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", color: N.muted }}>← Back</button>
                  <button onClick={submit} disabled={saving} className="btn btn-gold" style={{ flex: 2, padding: 14, fontSize: 15 }}>
                    {saving ? <><span className="spinner" />Submitting…</> : "Submit application →"}
                  </button>
                </div>

                <div style={{ marginTop: 16, fontSize: 12, color: N.muted, textAlign: "center", lineHeight: 1.6 }}>
                  By submitting, you agree to be contacted by our team for verification. Your profile won't go live until manually approved.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {[["🔍", "Get discovered", "Appear in searches by property seekers in your area"], ["📋", "List properties", "Add unlimited listings to your verified profile"], ["⭐", "Build reputation", "Collect reviews and grow your rating over time"]].map(([icon, title, desc]) => (
            <div key={title} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${N.border}`, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: N.text, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: N.muted, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}