import { useState } from "react";
import { IconFileText, IconSparkles, IconX } from "@tabler/icons-react";

const TIPS = [
  "3–5 sentences is the sweet spot — ATS and recruiters both prefer it.",
  "Open with your title + years of experience.",
  "Mention 2–3 of your strongest technical skills.",
  "End with what you're looking for or your core value-add.",
];

export default function Summary({ summary, onChange }) {
  const [aiOpen, setAiOpen] = useState(false);
  const charCount = summary.length;
  const ideal     = charCount >= 200 && charCount <= 700;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconFileText size={18} color="#7F77DD" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Professional summary</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>A short paragraph at the top of your resume — ATS reads this carefully.</div>
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: "#F8F8FF", border: "1px solid #E0DFFB", borderRadius: 10, padding: "12px 14px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#26215C", margin: "0 0 7px" }}>Writing tips</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {TIPS.map((t, i) => (
            <li key={i} style={{ display: "flex", gap: 6, fontSize: 12, color: "#5F5E5A" }}>
              <span style={{ color: "#7F77DD", fontWeight: 700, flexShrink: 0 }}>·</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Textarea + AI button */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <label className="riq-label" style={{ marginBottom: 0 }} htmlFor="summary-text">Summary text</label>
          <button
            onClick={() => setAiOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#7F77DD", fontSize: 12, fontWeight: 500, fontFamily: "inherit" }}
          >
            <IconSparkles size={12} /> Improve with AI
          </button>
        </div>
        <textarea
          id="summary-text"
          className="riq-input"
          style={{ minHeight: 140 }}
          placeholder={
            "Results-driven data scientist with 5+ years building ML pipelines at scale. " +
            "Expertise in Python, PyTorch, and AWS SageMaker. " +
            "Passionate about translating data insights into measurable business outcomes."
          }
          value={summary}
          onChange={e => onChange(e.target.value)}
        />
        {/* Character count indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 11, color: ideal ? "#1D9E75" : charCount > 700 ? "#D85A30" : "#9B9A97" }}>
            {charCount} characters {ideal ? "✓ ideal length" : charCount > 700 ? "— a bit long" : charCount > 0 ? "— aim for 200–700" : ""}
          </span>
        </div>
      </div>

      {/* AI rewriter */}
      {aiOpen && (
        <SummaryAI
          onAccept={text => { onChange(text); setAiOpen(false); }}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

function SummaryAI({ onAccept, onClose }) {
  const [raw,  setRaw]  = useState("");
  const [out,  setOut]  = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function go() {
    if (!raw.trim()) return;
    setBusy(true); setErr("");
    try {
      const { builder } = await import("../../services/api");
      const { rewritten } = await builder.rewriteBullet(raw, "professional summary");
      setOut(rewritten);
    } catch (e) { setErr(e.message ?? "AI unavailable."); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 14, borderRadius: 10, background: "#EEEDFE", border: "1px solid #C4C0F0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#26215C" }}>✨ AI summary rewriter</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97" }}>
          <IconX size={13} />
        </button>
      </div>
      <textarea
        className="riq-input"
        style={{ minHeight: 64, fontSize: 13 }}
        placeholder="Describe yourself in rough terms — role, years of experience, key skills…"
        value={raw}
        onChange={e => setRaw(e.target.value)}
      />
      <button
        className="riq-btn riq-btn-primary"
        style={{ marginTop: 8, padding: "7px 16px", fontSize: 13 }}
        onClick={go}
        disabled={busy || !raw.trim()}
      >
        {busy ? "Rewriting…" : "Rewrite →"}
      </button>
      {err && <p style={{ color: "#D85A30", fontSize: 12, margin: "6px 0 0" }}>{err}</p>}
      {out && (
        <div style={{ marginTop: 10, padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #E8E7E2" }}>
          <p style={{ fontSize: 13, color: "#26215C", lineHeight: 1.6, margin: "0 0 10px" }}>{out}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="riq-btn riq-btn-teal" style={{ padding: "5px 14px", fontSize: 12 }} onClick={() => onAccept(out)}>✓ Use this</button>
            <button className="riq-btn riq-btn-secondary" style={{ padding: "5px 14px", fontSize: 12 }} onClick={go}>↺ Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
