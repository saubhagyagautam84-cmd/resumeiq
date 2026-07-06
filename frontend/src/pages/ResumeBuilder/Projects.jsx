import { useState } from "react";
import { IconCode, IconPlus, IconX, IconSparkles } from "@tabler/icons-react";

function emptyEntry() {
  return { title: "", description: "", skills: [], links: [] };
}

export default function Projects({ entries, onChange }) {
  function update(i, field, val) {
    onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }
  function add()     { onChange([...entries, emptyEntry()]); }
  function remove(i) { onChange(entries.filter((_, idx) => idx !== i)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FBEAF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconCode size={18} color="#72243E" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Projects</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Highlight work that shows your skills in action.</div>
        </div>
      </div>

      {entries.map((entry, i) => (
        <ProjectCard key={i} entry={entry} index={i} onUpdate={(f, v) => update(i, f, v)} onRemove={() => remove(i)} />
      ))}

      <button
        onClick={add}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "#FBEAF0", border: "1.5px dashed #D4A0B0", padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#72243E", cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}
      >
        <IconPlus size={15} /> Add project
      </button>
    </div>
  );
}

function ProjectCard({ entry, index, onUpdate, onRemove }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div style={{ border: "1.5px solid #E8E7E2", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: 4, background: "#72243E", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "14px 16px 14px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#26215C" }}>
              {entry.title || `Project ${index + 1}`}
            </span>
            <button onClick={onRemove} aria-label="Remove project" style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 3 }}>
              <IconX size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="riq-label" htmlFor={`proj-title-${index}`}>Project name</label>
              <input id={`proj-title-${index}`} className="riq-input" placeholder="e.g. E-commerce recommendation engine" value={entry.title} onChange={e => onUpdate("title", e.target.value)} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label className="riq-label" style={{ marginBottom: 0 }} htmlFor={`proj-desc-${index}`}>Description</label>
                <button
                  onClick={() => setAiOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#7F77DD", fontSize: 12, fontWeight: 500, fontFamily: "inherit" }}
                >
                  <IconSparkles size={12} /> Improve with AI
                </button>
              </div>
              <textarea id={`proj-desc-${index}`} className="riq-input" style={{ minHeight: 72 }} placeholder={"Built a real-time recommendation system using collaborative filtering…\nReduced cart abandonment by 18% in A/B test."} value={entry.description} onChange={e => onUpdate("description", e.target.value)} />
            </div>

            {aiOpen && <ProjectAI context={entry.title} onAccept={b => { onUpdate("description", (entry.description ? entry.description + "\n" : "") + b); setAiOpen(false); }} onClose={() => setAiOpen(false)} />}

            <div>
              <label className="riq-label" htmlFor={`proj-tech-${index}`}>Technologies used</label>
              <input id={`proj-tech-${index}`} className="riq-input" placeholder="Python, React, PostgreSQL, Docker" value={(entry.skills ?? []).join(", ")} onChange={e => onUpdate("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
              <div style={{ fontSize: 11, color: "#9B9A97", marginTop: 3 }}>Comma-separated</div>
            </div>

            <div>
              <label className="riq-label" htmlFor={`proj-links-${index}`}>Links <span style={{ color: "#9B9A97", fontWeight: 400 }}>(optional)</span></label>
              <input id={`proj-links-${index}`} className="riq-input" placeholder="github.com/you/project" value={(entry.links ?? []).join(", ")} onChange={e => onUpdate("links", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectAI({ context, onAccept, onClose }) {
  const [raw, setRaw] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    setBusy(true); setErr("");
    try {
      const { builder } = await import("../../services/api");
      const { rewritten } = await builder.rewriteBullet(raw, context);
      setOut(rewritten);
    } catch (e) { setErr(e.message ?? "AI unavailable."); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#EEEDFE", border: "1px solid #C4C0F0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#26215C" }}>✨ AI rewriter</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97" }}><IconX size={12} /></button>
      </div>
      <textarea className="riq-input" style={{ minHeight: 48, fontSize: 13 }} placeholder="Describe what the project did…" value={raw} onChange={e => setRaw(e.target.value)} />
      <button className="riq-btn riq-btn-primary" style={{ marginTop: 6, padding: "6px 14px", fontSize: 12 }} onClick={go} disabled={busy || !raw.trim()}>{busy ? "Rewriting…" : "Rewrite →"}</button>
      {err && <p style={{ color: "#D85A30", fontSize: 12, margin: "6px 0 0" }}>{err}</p>}
      {out && (
        <div style={{ marginTop: 8, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid #E8E7E2" }}>
          <p style={{ fontSize: 13, color: "#26215C", margin: "0 0 8px" }}>{out}</p>
          <button className="riq-btn riq-btn-teal" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => onAccept(out)}>✓ Insert</button>
        </div>
      )}
    </div>
  );
}
