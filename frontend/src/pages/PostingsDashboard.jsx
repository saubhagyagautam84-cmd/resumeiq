import { useState } from "react";
import { IconPlus, IconBriefcase, IconUsers, IconClock, IconArrowRight } from "@tabler/icons-react";

const DEPT_COLORS = {
  Engineering: { gradient: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)", bg: "#EEEDFE", text: "#534AB7" },
  Design:      { gradient: "linear-gradient(135deg, #C94D7C 0%, #72243E 100%)", bg: "#FBEAF0", text: "#C94D7C" },
  Operations:  { gradient: "linear-gradient(135deg, #1D9E75 0%, #085041 100%)", bg: "#E1F5EE", text: "#0F6E56" },
  Default:     { gradient: "linear-gradient(135deg, #2E7AC9 0%, #0C447C 100%)", bg: "#EAF3FB", text: "#2E7AC9" },
};

const STATUS_PILL = {
  Open:   { bg: "#DCFCE7", color: "#166534", dot: "#22C55E" },
  Paused: { bg: "#FEF9C3", color: "#713F12", dot: "#F59E0B" },
  Closed: { bg: "#F4F4F5", color: "#52525B", dot: "#A1A1AA" },
};

const DEMO_POSTINGS = [
  { id: 1, title: "Senior ML engineer", status: "Open",   candidates: 3,  daysOpen: 12, dept: "Engineering" },
  { id: 2, title: "Product designer",   status: "Open",   candidates: 8,  daysOpen: 5,  dept: "Design" },
  { id: 3, title: "Support specialist", status: "Closed", candidates: 14, daysOpen: 30, dept: "Operations" },
];

export default function PostingsDashboard({ onNavigate }) {
  const [postings, setPostings] = useState(DEMO_POSTINGS);
  const [showNew, setShowNew]   = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function createPosting() {
    if (!newTitle.trim()) return;
    setPostings(p => [...p, { id: Date.now(), title: newTitle.trim(), status: "Open", candidates: 0, daysOpen: 0, dept: "" }]);
    setNewTitle(""); setShowNew(false);
  }

  const openCount = postings.filter(p => p.status === "Open").length;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 48px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{
            fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5,
            background: "linear-gradient(135deg, #26215C 0%, #7F77DD 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Job postings</h2>
          <p style={{ fontSize: 13, color: "#71717A", margin: "5px 0 0 0" }}>
            <span style={{ color: "#22C55E", fontWeight: 700 }}>{openCount} open</span>
            {" "}· {postings.length} total
          </p>
        </div>
        <button
          className="riq-btn riq-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setShowNew(true)}
        >
          <IconPlus size={15} /> New posting
        </button>
      </div>

      {/* New posting form */}
      {showNew && (
        <div style={{
          background: "#fff", borderRadius: 14,
          boxShadow: "0 4px 20px rgba(127,119,221,0.15), 0 1px 4px rgba(0,0,0,0.06)",
          border: "1.5px solid #C9C4FB",
          padding: "18px 20px", marginBottom: 22,
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <div style={{ flex: 1 }}>
            <label className="riq-label" htmlFor="new-title">Job title</label>
            <input
              id="new-title"
              className="riq-input"
              placeholder="e.g. Frontend engineer, Sales manager…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createPosting(); if (e.key === "Escape") setShowNew(false); }}
              autoFocus
            />
          </div>
          <button className="riq-btn riq-btn-primary" onClick={createPosting} disabled={!newTitle.trim()}>Create</button>
          <button className="riq-btn riq-btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {postings.map(p => (
          <PostingCard key={p.id} posting={p} onViewShortlist={() => onNavigate?.("shortlisting")} />
        ))}
      </div>
    </div>
  );
}

function PostingCard({ posting: p, onViewShortlist }) {
  const pill  = STATUS_PILL[p.status] ?? STATUS_PILL.Open;
  const dept  = DEPT_COLORS[p.dept]   ?? DEPT_COLORS.Default;

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)",
      overflow: "hidden",
      transition: "transform 0.18s, box-shadow 0.18s",
    }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.07), 0 12px 30px rgba(0,0,0,0.09)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)"; }}
    >
      {/* Gradient banner */}
      <div style={{ background: dept.gradient, height: 5 }} />

      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Icon + title + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: dept.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <IconBriefcase size={16} color={dept.text} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#18181B", lineHeight: 1.3 }}>{p.title}</div>
              {p.dept && (
                <div style={{
                  fontSize: 11, color: dept.text, fontWeight: 600, marginTop: 2,
                  background: dept.bg, display: "inline-block",
                  padding: "1px 7px", borderRadius: 10,
                }}>{p.dept}</div>
              )}
            </div>
          </div>
          {/* Status pill with dot */}
          <span style={{
            display: "flex", alignItems: "center", gap: 5,
            background: pill.bg, color: pill.color,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: pill.dot, display: "inline-block" }} />
            {p.status}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20 }}>
          <Stat icon={IconUsers} label={`${p.candidates} candidate${p.candidates !== 1 ? "s" : ""}`} color="#7F77DD" />
          <Stat icon={IconClock} label={`${p.daysOpen} day${p.daysOpen !== 1 ? "s" : ""} open`} color="#71717A" />
        </div>

        {/* CTA */}
        <button
          onClick={onViewShortlist}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #F0EFFE 0%, #E8E5FF 100%)",
            border: "1.5px solid #C9C4FB", borderRadius: 10,
            padding: "9px 14px", cursor: "pointer", width: "100%",
            fontSize: 13, fontWeight: 600, color: "#26215C",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.background = "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "transparent"; }}
          onMouseOut={e => { e.currentTarget.style.background = "linear-gradient(135deg, #F0EFFE 0%, #E8E5FF 100%)"; e.currentTarget.style.color = "#26215C"; e.currentTarget.style.borderColor = "#C9C4FB"; }}
        >
          View shortlist
          <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={13} color={color} />
      <span style={{ fontSize: 12, color: "#52525B", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
