import { useState } from "react";
import { IconBriefcase, IconPlus, IconX, IconSparkles } from "@tabler/icons-react";

const CARD_ACCENTS = ["#D85A30", "#7F77DD", "#1D9E75", "#BA7517", "#0C447C"];

function emptyEntry() {
  return { title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" };
}

export default function Experience({ entries, onChange, resumeId }) {
  function update(i, field, val) {
    onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }
  function add()      { onChange([...entries, emptyEntry()]); }
  function remove(i)  { onChange(entries.filter((_, idx) => idx !== i)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#FAECE7",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconBriefcase size={18} color="#D85A30" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Work experience</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Start with your most recent role.</div>
        </div>
      </div>

      {entries.map((entry, i) => (
        <ExperienceCard
          key={i}
          entry={entry}
          index={i}
          accentColor={CARD_ACCENTS[i % CARD_ACCENTS.length]}
          onUpdate={(f, v) => update(i, f, v)}
          onRemove={() => remove(i)}
          resumeId={resumeId}
        />
      ))}

      <button
        onClick={add}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#EEEDFE", color: "#26215C",
          border: "1.5px dashed #C4C0F0",
          padding: "10px 16px", borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: "pointer",
          fontFamily: "inherit", width: "fit-content",
        }}
      >
        <IconPlus size={15} /> Add position
      </button>
    </div>
  );
}

function ExperienceCard({ entry, index, accentColor, onUpdate, onRemove, resumeId }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: "1.5px solid #E8E7E2",
    }}>
      {/* Colored left border accent */}
      <div style={{ display: "flex" }}>
        <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "16px 16px 16px 14px" }}>
          {/* Card header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <input
                className="riq-input"
                style={{ fontWeight: 600, fontSize: 15, color: "#26215C", border: "none", padding: "0", outline: "none", background: "transparent", width: "100%" }}
                placeholder="Job title"
                value={entry.title}
                onChange={e => onUpdate("title", e.target.value)}
              />
              <input
                className="riq-input"
                style={{ fontSize: 13, color: "#5F5E5A", border: "none", padding: "2px 0 0 0", outline: "none", background: "transparent", width: "100%" }}
                placeholder="Company name"
                value={entry.company}
                onChange={e => onUpdate("company", e.target.value)}
              />
            </div>
            <button
              onClick={onRemove}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 4 }}
            >
              <IconX size={15} />
            </button>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <div>
              <label className="riq-label">Start date</label>
              <input className="riq-input" placeholder="Jan 2022" value={entry.start_date} onChange={e => onUpdate("start_date", e.target.value)} />
            </div>
            <div>
              <label className="riq-label">End date</label>
              <input className="riq-input" placeholder="Dec 2024 or Present" value={entry.end_date} disabled={entry.is_current} onChange={e => onUpdate("end_date", e.target.value)} />
            </div>
            <div style={{ paddingTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox" id={`cur-${index}`}
                checked={entry.is_current || false}
                onChange={e => { onUpdate("is_current", e.target.checked); if (e.target.checked) onUpdate("end_date", "Present"); }}
              />
              <label htmlFor={`cur-${index}`} style={{ fontSize: 12, color: "#5F5E5A", cursor: "pointer" }}>Current</label>
            </div>
          </div>

          {/* Description + AI button */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label className="riq-label" style={{ marginBottom: 0 }}>Bullet points / description</label>
              <button
                onClick={() => setAiOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  color: "#7F77DD", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                }}
              >
                <IconSparkles size={13} /> Improve with AI
              </button>
            </div>
            <textarea
              className="riq-input"
              style={{ minHeight: 80 }}
              placeholder={"• Led a team of 5 engineers…\n• Reduced latency by 40% by…"}
              value={entry.description}
              onChange={e => onUpdate("description", e.target.value)}
            />
          </div>

          {/* AI rewriter popover */}
          {aiOpen && (
            <AIRewriter
              context={[entry.title, entry.company].filter(Boolean).join(" at ")}
              resumeId={resumeId}
              onAccept={bullet => {
                onUpdate("description", (entry.description ? entry.description + "\n" : "") + bullet);
                setAiOpen(false);
              }}
              onClose={() => setAiOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AIRewriter({ context, resumeId, onAccept, onClose }) {
  const [raw,        setRaw]        = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState("");

  async function rewrite() {
    if (!raw.trim()) return;
    setLoading(true); setErr("");
    try {
      const { builder } = await import("../../services/api");
      const { rewritten } = await builder.rewriteBullet(raw, context);
      setSuggestion(rewritten);
    } catch (e) { setErr(e.message ?? "AI unavailable."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      marginTop: 10, padding: 14, borderRadius: 10,
      background: "#EEEDFE", border: "1px solid #C4C0F0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#26215C" }}>✨ AI bullet rewriter</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 2 }}>
          <IconX size={13} />
        </button>
      </div>
      <textarea
        className="riq-input"
        style={{ minHeight: 52, fontSize: 13 }}
        placeholder="Describe what you did in rough terms…"
        value={raw}
        onChange={e => setRaw(e.target.value)}
      />
      <button
        className="riq-btn riq-btn-primary"
        style={{ marginTop: 8, padding: "7px 16px", fontSize: 13 }}
        onClick={rewrite}
        disabled={loading || !raw.trim()}
      >
        {loading ? "Rewriting…" : "Rewrite →"}
      </button>
      {err && <p style={{ color: "#D85A30", fontSize: 12, margin: "6px 0 0 0" }}>{err}</p>}
      {suggestion && (
        <div style={{ marginTop: 10, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid #E8E7E2" }}>
          <p style={{ fontSize: 13, color: "#26215C", margin: "0 0 8px 0" }}>{suggestion}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="riq-btn riq-btn-teal"
              style={{ padding: "5px 14px", fontSize: 12 }}
              onClick={() => onAccept(suggestion)}
            >
              ✓ Insert
            </button>
            <button
              className="riq-btn riq-btn-secondary"
              style={{ padding: "5px 14px", fontSize: 12 }}
              onClick={rewrite}
            >
              ↺ Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
