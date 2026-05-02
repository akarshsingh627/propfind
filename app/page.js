"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const AREAS = ["All areas", "Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Alambagh", "Chinhat"];

const N = {
  navy900: "#050D1F", navy800: "#0A1628", navy700: "#0F2040",
  navy600: "#162B55", navy500: "#1E3A6E", navy400: "#2A4F8F",
  gold: "#C9963A", goldLight: "#E8B84B", goldPale: "#FDF3DC",
  white: "#FFFFFF", offWhite: "#F5F7FC", border: "#E0E6F2",
  muted: "#6B82A8", text: "#0A1628",
};

const AV = [
  { bg: "#D6E4FF", text: "#0F2040" }, { bg: "#D1F5E8", text: "#0A3828" },
  { bg: "#E8D6FF", text: "#2A0A50" }, { bg: "#FFE8D6", text: "#50200A" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'Inter',sans-serif; background:${N.offWhite}; color:${N.text}; -webkit-font-smoothing:antialiased; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dot     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(201,150,58,0)} 50%{box-shadow:0 0 14px 4px rgba(201,150,58,0.35)} }
  .fu  { animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
  .fu2 { animation:fadeUp .5s .09s cubic-bezier(.22,1,.36,1) both; }
  .fu3 { animation:fadeUp .5s .18s cubic-bezier(.22,1,.36,1) both; }
  .fu4 { animation:fadeUp .5s .27s cubic-bezier(.22,1,.36,1) both; }
  .fu5 { animation:fadeUp .5s .36s cubic-bezier(.22,1,.36,1) both; }
  .card { background:#fff; border-radius:20px; border:1px solid ${N.border}; overflow:hidden; transition:transform .25s ease,box-shadow .25s ease; cursor:pointer; }
  .card:hover { transform:translateY(-5px); box-shadow:0 20px 56px rgba(10,22,40,.13); }
  .chip { padding:8px 18px; border-radius:30px; border:1.5px solid ${N.border}; font-size:13px; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:all .18s; white-space:nowrap; background:#fff; color:${N.muted}; }
  .chip:hover { border-color:${N.navy500}; color:${N.navy500}; }
  .chip.on { background:${N.navy500}; color:#fff; border-color:${N.navy500}; }
  .btn { background:${N.navy500}; color:#fff; border:none; border-radius:12px; padding:14px 30px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:background .18s,transform .14s; }
  .btn:hover { background:${N.navy600}; transform:translateY(-1px); }
  .btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .btn-gold { background:linear-gradient(135deg,${N.gold} 0%,${N.goldLight} 100%); color:#fff; }
  .btn-gold:hover { background:linear-gradient(135deg,#B8832A 0%,${N.gold} 100%); }
  .btn-ghost { background:transparent; color:${N.gold}; border:2px solid rgba(201,150,58,0.5); border-radius:12px; padding:12px 26px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all .18s; }
  .btn-ghost:hover { background:rgba(201,150,58,0.12); border-color:${N.gold}; }
  .pill { display:inline-flex; align-items:center; gap:4px; padding:3px 11px; border-radius:30px; font-size:11px; font-weight:600; }
  .gold-line { height:3px; background:linear-gradient(90deg,${N.gold},${N.goldLight},transparent); border-radius:2px; }
  .spinner { width:32px; height:32px; border:3px solid ${N.border}; border-top-color:${N.navy500}; border-radius:50%; animation:spin .8s linear infinite; margin:0 auto; }
  input,select,textarea { font-family:'Inter',sans-serif; }
  input::placeholder,textarea::placeholder { color:#B0BCCC; }
  ::-webkit-scrollbar { height:3px; width:3px; }
  ::-webkit-scrollbar-thumb { background:#C8D4E8; border-radius:4px; }
`;

// ── HELPERS ──
function Stars({ rating, size = 13 }) {
  return <span style={{ color: N.gold, fontSize: size, letterSpacing: 2 }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>;
}

function Avatar({ initials, idx, size = 52 }) {
  const c = AV[idx % AV.length];
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, fontFamily: "'Playfair Display',serif", flexShrink: 0, border: "2px solid rgba(255,255,255,0.6)" }}>
      {initials}
    </div>
  );
}

function Loader() {
  return <div style={{ padding: "80px 0", textAlign: "center" }}><div className="spinner" /></div>;
}

// ── NAVBAR ──
function Navbar({ onHome, onListProperty }) {
  return (
    <nav style={{ background: N.navy900, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${N.navy700}` }}>
      <div onClick={onHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(201,150,58,0.4)" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 19, color: N.navy900 }}>P</span>
        </div>
        <div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-.02em" }}>PropFind</span>
          <span style={{ fontSize: 10, color: N.gold, marginLeft: 8, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>Lucknow</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: N.muted }}>
          <span style={{ width: 7, height: 7, background: "#22C55E", borderRadius: "50%", display: "inline-block", animation: "dot 2s infinite" }} />
          Live · updated today
        </div>
        <button onClick={onListProperty} className="btn btn-gold" style={{ padding: "9px 20px", fontSize: 13, animation: "glow 3s infinite" }}>
          List property free
        </button>
      </div>
    </nav>
  );
}

// ── HOME ──
function Home({ onBrowse, onListProperty, agentCount }) {
  return (
    <div>
      <div style={{ background: `linear-gradient(160deg,${N.navy900} 0%,${N.navy700} 55%,${N.navy600} 100%)`, padding: "88px 32px 108px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(201,150,58,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,0.04) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, background: "radial-gradient(circle,rgba(201,150,58,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,150,58,0.12)", border: "1px solid rgba(201,150,58,0.25)", borderRadius: 30, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, background: N.goldLight, borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: N.goldLight, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Lucknow's property agent directory</span>
          </div>
          <h1 className="fu2" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(40px,6.5vw,72px)", color: "#fff", fontWeight: 800, lineHeight: 1.08, marginBottom: 22, letterSpacing: "-.03em" }}>
            Find a trusted agent.<br />
            <span style={{ background: `linear-gradient(90deg,${N.gold},${N.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Find your property.</span>
          </h1>
          <p className="fu3" style={{ fontSize: 17, color: "#7DA0CC", lineHeight: 1.8, marginBottom: 48, maxWidth: 520 }}>
            Browse every registered agent in Lucknow, explore their verified listings — rent or sale — and connect directly. Zero spam. Zero middlemen.
          </p>
          <div className="fu4" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <button onClick={onBrowse} className="btn" style={{ fontSize: 16, padding: "16px 40px", background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, color: N.navy900, fontWeight: 700, boxShadow: "0 8px 32px rgba(201,150,58,0.35)" }}>
              Browse agents →
            </button>
            <button onClick={onListProperty} className="btn-ghost">List your property free</button>
          </div>
          <div className="fu5" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["✓  Verified agents only", "📋  Rent & sale listings", "📞  Direct contact", "₹0  Free for users"].map(t => (
              <span key={t} style={{ fontSize: 12, color: "#7DA0CC", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 30, fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="gold-line" />

      <div style={{ background: "#fff", padding: "28px 32px", borderBottom: `1px solid ${N.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 20 }}>
          {[[agentCount || "—", "Registered agents"], ["Live", "Listings today"], ["8 areas", "Across Lucknow"], ["₹0", "Free for users"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: N.navy500, marginBottom: 4 }}>{num}</div>
              <div style={{ fontSize: 12, color: N.muted, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "68px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 800, color: N.text, marginBottom: 10, letterSpacing: "-.02em" }}>How PropFind works</div>
          <div className="gold-line" style={{ width: 60, margin: "0 auto 16px" }} />
          <div style={{ fontSize: 15, color: N.muted }}>Simple, fast, and completely free for property seekers</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 20 }}>
          {[["01", "🏙️", "Choose your area", "Select your locality in Lucknow — Gomti Nagar, Hazratganj, Aliganj, and more."], ["02", "🤝", "Browse agents", "See every registered agent with ratings, experience, and specialisations."], ["03", "📋", "Explore listings", "Filter by rent or sale, pick a property type, and contact the agent directly."]].map(([num, icon, title, desc]) => (
            <div key={num} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${N.border}`, padding: "30px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${N.gold},${N.goldLight})` }} />
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 800, color: N.border, marginBottom: 12 }}>{num}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: N.text, marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 13, color: N.muted, lineHeight: 1.75 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ background: `linear-gradient(135deg,${N.navy900} 0%,${N.navy600} 100%)`, borderRadius: 24, padding: "48px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, bottom: -60, width: 240, height: 240, border: "1px solid rgba(201,150,58,0.15)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Have a property to list?</div>
            <div style={{ fontSize: 14, color: "#7DA0CC", lineHeight: 1.7, maxWidth: 360 }}>Submit a free ticket. Registered agents will reach out and find you buyers or tenants.</div>
          </div>
          <button onClick={onListProperty} className="btn btn-gold" style={{ position: "relative", padding: "15px 34px", fontSize: 15, flexShrink: 0, boxShadow: "0 8px 28px rgba(201,150,58,0.4)" }}>
            Create free listing →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DIRECTORY (live from Supabase) ──
function Directory({ onAgent, onListProperty }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState("All areas");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("agents").select("*");
      if (!error) setAgents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = agents.filter(a => {
    if (area !== "All areas" && !a.areas?.includes(area)) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => sort === "rating" ? b.rating - a.rating : b.listings - a.listings);

  return (
    <div>
      <div style={{ background: `linear-gradient(160deg,${N.navy900} 0%,${N.navy600} 100%)`, padding: "44px 32px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(201,150,58,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,0.03) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <h2 className="fu" style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-.02em" }}>
            Property agents in <span style={{ background: `linear-gradient(90deg,${N.gold},${N.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lucknow</span>
          </h2>
          <p className="fu2" style={{ fontSize: 14, color: "#7DA0CC", marginBottom: 28 }}>{filtered.length} registered agents · browse by area</p>
          <div className="fu3" style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#7DA0CC", fontSize: 18 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by agent name…"
              style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "15px 18px 15px 48px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#fff", transition: "border .18s" }}
              onFocus={e => e.target.style.borderColor = "rgba(201,150,58,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "-28px auto 0", padding: "0 32px 72px" }}>
        <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${N.border}`, padding: "18px 20px", marginBottom: 20, boxShadow: "0 4px 20px rgba(10,22,40,0.07)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Filter by area</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {AREAS.map(a => <button key={a} onClick={() => setArea(a)} className={`chip ${area === a ? "on" : ""}`}>{a}</button>)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: N.muted, fontWeight: 500 }}>{filtered.length} agents found</span>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ border: `1.5px solid ${N.border}`, borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 500, outline: "none", background: "#fff", cursor: "pointer", color: N.text }}>
            <option value="rating">Top rated</option>
            <option value="listings">Most listings</option>
          </select>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 0", color: N.muted }}>
            <div style={{ fontSize: 40, marginBottom: 14, opacity: .3 }}>○</div>
            <div style={{ fontWeight: 500 }}>No agents in this area yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.map((agent, i) => (
              <div key={agent.id} className="card fu" style={{ animationDelay: `${i * 0.07}s` }} onClick={() => onAgent(agent.id)}>
                <div style={{ height: 3, background: `linear-gradient(90deg,${N.gold},${N.goldLight},transparent)` }} />
                <div style={{ padding: "24px 26px" }}>
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
                    <Avatar initials={agent.initials} idx={i} size={56} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: N.text, marginBottom: 4 }}>{agent.name}</div>
                          <div style={{ fontSize: 12, color: N.muted, marginBottom: 10, fontWeight: 500 }}>{agent.areas?.join(" · ")} · {agent.experience}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {agent.verified && <span className="pill" style={{ background: "#E0F5EE", color: "#0A5C38" }}>✓ Verified</span>}
                            {agent.tags?.slice(0, 2).map(t => <span key={t} className="pill" style={{ background: "#EEF2FF", color: N.navy500 }}>{t}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: N.text }}>{agent.rating}</div>
                          <Stars rating={agent.rating} size={12} />
                          <div style={{ fontSize: 11, color: "#B0BCCC", marginTop: 3 }}>{agent.reviews} reviews</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {[["Total", agent.listings, N.navy500], ["For rent", agent.rent, "#0A5C38"], ["For sale", agent.sale, "#7A4000"]].map(([l, v, col]) => (
                      <div key={l} style={{ background: N.offWhite, borderRadius: 12, padding: "14px", textAlign: "center", border: `1px solid ${N.border}` }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: col }}>{v}</div>
                        <div style={{ fontSize: 11, color: N.muted, marginTop: 3, fontWeight: 500 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {agent.tags?.slice(2).map(t => <span key={t} className="pill" style={{ background: N.offWhite, color: N.muted, border: `1px solid ${N.border}` }}>{t}</span>)}
                    </div>
                    <span style={{ fontSize: 13, color: N.gold, fontWeight: 700 }}>View profile →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, background: N.goldPale, border: "1px solid rgba(201,150,58,0.25)", borderRadius: 20, padding: "26px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: N.text, marginBottom: 5 }}>Selling or renting out?</div>
            <div style={{ fontSize: 13, color: "#9A7A40", lineHeight: 1.6 }}>Submit a free ticket — agents will contact you directly.</div>
          </div>
          <button onClick={onListProperty} className="btn btn-gold" style={{ boxShadow: "0 4px 16px rgba(201,150,58,0.3)" }}>Create free listing</button>
        </div>
      </div>
    </div>
  );
}

// ── AGENT PROFILE (live from Supabase) ──
function AgentProfile({ agentId, onBack }) {
  const [agent, setAgent] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [called, setCalled] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: a }, { data: l }] = await Promise.all([
        supabase.from("agents").select("*").eq("id", agentId).single(),
        supabase.from("listings").select("*").eq("agent_id", agentId),
      ]);
      if (a) setAgent(a);
      if (l) setListings(l);
      setLoading(false);
    }
    load();
  }, [agentId]);

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;
  if (!agent) return <div style={{ padding: 40, textAlign: "center", color: N.muted }}>Agent not found.</div>;

  const filteredListings = listings.filter(l => {
    if (filter !== "All" && l.type !== filter) return false;
    if (catFilter !== "All" && l.cat !== catFilter) return false;
    return true;
  });

  const cats = ["All", ...new Set(listings.map(l => l.cat))];
  const agentIdx = 0;

  return (
    <div>
      <div style={{ background: `linear-gradient(160deg,${N.navy900} 0%,${N.navy600} 100%)`, padding: "36px 32px 68px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(201,150,58,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,58,0.03) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, background: "radial-gradient(circle,rgba(201,150,58,0.1) 0%,transparent 70%)" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#7DA0CC", fontSize: 13, cursor: "pointer", marginBottom: 24, fontFamily: "'Inter',sans-serif", padding: 0, fontWeight: 500 }}>← All agents</button>
          <div className="fu" style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Avatar initials={agent.initials} idx={agentIdx} size={72} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>{agent.name}</h2>
                {agent.verified && <span className="pill" style={{ background: "rgba(34,197,94,0.15)", color: "#86EFAC", border: "1px solid rgba(34,197,94,0.3)" }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize: 13, color: "#7DA0CC", marginBottom: 12, fontWeight: 500 }}>{agent.areas?.join(" · ")} · Since {agent.since} · {agent.experience}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Stars rating={agent.rating} size={15} />
                <span style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>{agent.rating}</span>
                <span style={{ fontSize: 13, color: "#7DA0CC" }}>({agent.reviews} reviews)</span>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {called ? (
                <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "14px 22px", textAlign: "center", minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: "#86EFAC", fontWeight: 600, marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>Call directly</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{agent.phone}</div>
                </div>
              ) : (
                <button onClick={() => setCalled(true)} className="btn btn-gold" style={{ padding: "13px 28px", boxShadow: "0 6px 24px rgba(201,150,58,0.4)" }}>Show number</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "-32px auto 0", padding: "0 32px 72px" }}>
        <div className="fu2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[["Total listings", agent.listings, N.navy500], ["For rent", agent.rent, "#0A5C38"], ["For sale", agent.sale, "#7A4000"]].map(([l, v, col]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 18, border: `1px solid ${N.border}`, padding: "22px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(10,22,40,0.06)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${N.gold},${N.goldLight})` }} />
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 800, color: col }}>{v}</div>
              <div style={{ fontSize: 12, color: N.muted, marginTop: 5, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>

        {agent.about && (
          <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${N.border}`, padding: "24px 26px", marginBottom: 28, boxShadow: "0 4px 20px rgba(10,22,40,0.05)" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: N.text, marginBottom: 12 }}>About</div>
            <div style={{ fontSize: 14, color: "#4A5A72", lineHeight: 1.8 }}>{agent.about}</div>
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {agent.tags?.map(t => <span key={t} className="pill" style={{ background: "#EEF2FF", color: N.navy500, fontSize: 12, padding: "5px 14px" }}>{t}</span>)}
            </div>
          </div>
        )}

        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: N.text, marginBottom: 16 }}>Listings</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {["All", "Rent", "Sale"].map(f => <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? "on" : ""}`}>{f}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {cats.map(c => <button key={c} onClick={() => setCatFilter(c)} className={`chip ${catFilter === c ? "on" : ""}`} style={{ fontSize: 12, padding: "5px 14px" }}>{c}</button>)}
        </div>

        {filteredListings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: N.muted }}>
            {listings.length === 0 ? "No listings added yet for this agent." : "No listings in this category."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredListings.map((l, i) => (
              <div key={l.id} className="fu" style={{ background: "#fff", border: `1px solid ${N.border}`, borderRadius: 16, overflow: "hidden", animationDelay: `${i * 0.06}s`, boxShadow: "0 2px 12px rgba(10,22,40,0.05)" }}>
                <div style={{ height: 3, background: l.type === "Rent" ? `linear-gradient(90deg,${N.navy500},${N.navy400})` : `linear-gradient(90deg,${N.gold},${N.goldLight})` }} />
                <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 800, color: N.text, marginBottom: 5 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: N.muted, marginBottom: 12, fontWeight: 500 }}>
                      {l.area} · {l.size}
                      {l.floor ? ` · ${l.floor} floor` : ""}
                      {l.beds ? ` · ${l.beds} bed / ${l.baths} bath` : ""}
                      {l.furnish ? ` · ${l.furnish}` : ""}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="pill" style={{ background: l.type === "Rent" ? "#EEF2FF" : N.goldPale, color: l.type === "Rent" ? N.navy500 : "#8A6020", border: `1px solid ${l.type === "Rent" ? "#D0D8FF" : "rgba(201,150,58,0.2)"}` }}>{l.type}</span>
                      <span className="pill" style={{ background: N.offWhite, color: N.muted, border: `1px solid ${N.border}` }}>{l.cat}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: N.navy500, marginBottom: 10 }}>{l.price}</div>
                    <button onClick={() => setCalled(true)}
                      style={{ background: "none", border: `1.5px solid ${N.navy500}`, borderRadius: 9, padding: "7px 16px", fontSize: 12, color: N.navy500, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600, transition: "all .18s" }}
                      onMouseOver={e => { e.target.style.background = N.navy500; e.target.style.color = "#fff"; }}
                      onMouseOut={e => { e.target.style.background = "none"; e.target.style.color = N.navy500; }}>
                      Enquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TICKET MODAL (saves to Supabase) ──
function TicketModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", area: "Gomti Nagar", type: "Rent", category: "House", price: "", desc: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("tickets").insert([{
      name: form.name,
      phone: form.phone,
      area: form.area,
      type: form.type,
      category: form.category,
      price: form.price,
      description: form.desc,
    }]);
    setSaving(false);
    if (err) { setError("Something went wrong. Please try again."); return; }
    setDone(true);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,13,31,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16, backdropFilter: "blur(6px)" }}>
      <div className="fu" style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(5,13,31,0.4)" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${N.navy900},${N.navy500},${N.gold})`, borderRadius: "24px 24px 0 0" }} />
        {done ? (
          <div style={{ padding: "56px 36px", textAlign: "center" }}>
            <div style={{ width: 68, height: 68, background: `linear-gradient(135deg,${N.gold},${N.goldLight})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, boxShadow: "0 8px 28px rgba(201,150,58,0.35)" }}>✓</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, marginBottom: 12, color: N.text }}>You're listed!</div>
            <div style={{ fontSize: 14, color: N.muted, lineHeight: 1.8, marginBottom: 32 }}>Verified agents in your area will review your property and contact you on WhatsApp within 24 hours.</div>
            <button onClick={onClose} className="btn" style={{ padding: "14px 40px", fontSize: 15 }}>Done</button>
          </div>
        ) : (
          <div style={{ padding: "30px 32px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: N.text, marginBottom: 4 }}>List your property</div>
                <div style={{ fontSize: 12, color: N.muted, fontWeight: 500 }}>Step {step} of 2 · Agents contact you free</div>
              </div>
              <button onClick={onClose} style={{ background: N.offWhite, border: `1px solid ${N.border}`, width: 36, height: 36, borderRadius: 10, fontSize: 18, cursor: "pointer", color: N.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? `linear-gradient(90deg,${N.navy500},${N.gold})` : N.border, transition: "background .3s" }} />)}
            </div>

            {step === 1 && (
              <>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color: N.text, marginBottom: 20 }}>Your contact details</div>
                {[["Full name", "name", "text", "e.g. Ramesh Kumar"], ["WhatsApp number", "phone", "tel", "e.g. 98765 43210"]].map(([label, key, type, ph]) => (
                  <div key={key} style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>{label}</label>
                    <input type={type} placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)}
                      style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border .18s", color: N.text }}
                      onFocus={e => e.target.style.borderColor = N.navy500} onBlur={e => e.target.style.borderColor = N.border} />
                  </div>
                ))}
                <button onClick={() => { if (form.name && form.phone) setStep(2); }} className="btn" style={{ width: "100%", padding: 15, marginTop: 4, fontSize: 15 }}>Continue →</button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color: N.text, marginBottom: 20 }}>Property details</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>Area in Lucknow</label>
                  <select value={form.area} onChange={e => set("area", e.target.value)}
                    style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", color: N.text }}>
                    {AREAS.slice(1).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[["Purpose", "type", ["Rent", "Sale"]], ["Category", "category", ["House", "Flat", "Shop", "Plot", "Office"]]].map(([label, key, opts]) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>{label}</label>
                      <select value={form[key]} onChange={e => set(key, e.target.value)}
                        style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", color: N.text }}>
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>Expected price / rent (₹)</label>
                  <input type="text" placeholder="e.g. 15,000/month or 45 Lakh" value={form.price} onChange={e => set("price", e.target.value)}
                    style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", boxSizing: "border-box", color: N.text }}
                    onFocus={e => e.target.style.borderColor = N.navy500} onBlur={e => e.target.style.borderColor = N.border} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 12, color: N.muted, fontWeight: 600, display: "block", marginBottom: 7 }}>Describe the property</label>
                  <textarea placeholder="Size, floor, furnishing, nearby landmarks…" value={form.desc} onChange={e => set("desc", e.target.value)}
                    style={{ width: "100%", border: `1.5px solid ${N.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 14, outline: "none", minHeight: 100, resize: "vertical", boxSizing: "border-box", color: N.text }} />
                </div>
                {error && <div style={{ color: "#E53E3E", fontSize: 13, marginBottom: 14, fontWeight: 500 }}>{error}</div>}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: N.offWhite, border: `1px solid ${N.border}`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", color: N.muted }}>← Back</button>
                  <button onClick={submit} disabled={saving} className="btn" style={{ flex: 2, padding: 14, fontSize: 15 }}>
                    {saving ? "Submitting…" : "Submit listing →"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ROOT ──
export default function PropFind() {
  const [view, setView] = useState("home");
  const [agentId, setAgentId] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [agentCount, setAgentCount] = useState(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    supabase.from("agents").select("id", { count: "exact", head: true })
      .then(({ count }) => setAgentCount(count));
  }, []);

  return (
    <>
      <Navbar onHome={() => setView("home")} onListProperty={() => setShowTicket(true)} />
      {view === "home" && <Home onBrowse={() => setView("directory")} onListProperty={() => setShowTicket(true)} agentCount={agentCount} />}
      {view === "directory" && <Directory onAgent={id => { setAgentId(id); setView("agent"); }} onListProperty={() => setShowTicket(true)} />}
      {view === "agent" && <AgentProfile agentId={agentId} onBack={() => setView("directory")} />}
      {showTicket && <TicketModal onClose={() => setShowTicket(false)} />}
    </>
  );
}