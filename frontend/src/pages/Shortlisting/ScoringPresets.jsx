import { useState } from "react";
import { IconX, IconDeviceFloppy, IconTrash, IconCheck } from "@tabler/icons-react";

const DEFAULT_PRESETS = [
  {
    id: 1, name: "Engineering roles",
    weights: { education: 0.10, experience: 0.35, skills: 0.35, projects: 0.10, certifications: 0.05, extras: 0.05 },
  },
  {
    id: 2, name: "Sales roles",
    weights: { education: 0.05, experience: 0.40, skills: 0.20, projects: 0.05, certifications: 0.10, extras: 0.20 },
  },
  {
    id: 3, name: "Research / academic",
    weights: { education: 0.30, experience: 0.20, skills: 0.25, projects: 0.15, certifications: 0.05, extras: 0.05 },
  },
];

const WEIGHT_KEYS = ["education", "experience", "skills", "projects", "certifications", "extras"];

const DOT_COLORS = ["#7F77DD", "#1D9E75", "#D85A30", "#BA7517", "#0C447C", "#9B9A97"];

function WeightDots({ weights }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
      {WEIGHT_KEYS.map((k, i) => {
        const pct = Math.round((weights[k] ?? 0) * 100);
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: DOT_COLORS[i], flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#5F5E5A" }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ScoringPresets({ currentWeights, onApply, onClose }) {
  const [presets,      setPresets]      = useState(DEFAULT_PRESETS);
  const [saveName,     setSaveName]     = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [applied,      setApplied]      = useState(null);

  function savePreset() {
    const name = saveName.trim();
    if (!name) return;
    setPresets(p => [...p, { id: Date.now(), name, weights: { ...currentWeights } }]);
    setSaveName(""); setShowSaveForm(false);
  }

  function deletePreset(id) {
    setPresets(p => p.filter(x => x.id !== id));
  }

  function applyPreset(preset) {
    onApply?.(preset.weights);
    setApplied(preset.id);
    setTimeout(() => setApplied(null), 1500);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Scoring presets"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, 95vw)", maxHeight: "82vh",
          background: "#fff", borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          zIndex: 201, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #E8E7E2" }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#26215C" }}>Scoring presets</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 3 }}>
            <IconX size={17} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {presets.map(preset => (
            <div key={preset.id} className="riq-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#26215C" }}>{preset.name}</div>
                  <WeightDots weights={preset.weights} />
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => applyPreset(preset)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "6px 12px", borderRadius: 8,
                      background: applied === preset.id ? "#E1F5EE" : "#EEEDFE",
                      color: applied === preset.id ? "#085041" : "#26215C",
                      border: "none", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "background 0.2s",
                    }}
                  >
                    {applied === preset.id ? <><IconCheck size={12} /> Applied</> : "Apply"}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    aria-label={`Delete preset ${preset.name}`}
                    style={{ background: "none", border: "1.5px solid #E8E7E2", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#9B9A97" }}
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save current as preset */}
        <div style={{ borderTop: "1px solid #E8E7E2", padding: "14px 18px" }}>
          {showSaveForm ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="riq-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="Preset name…"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") savePreset(); if (e.key === "Escape") setShowSaveForm(false); }}
                autoFocus
              />
              <button className="riq-btn riq-btn-primary" style={{ padding: "7px 14px", fontSize: 13 }} onClick={savePreset} disabled={!saveName.trim()}>
                Save
              </button>
              <button className="riq-btn riq-btn-secondary" style={{ padding: "7px 12px", fontSize: 13 }} onClick={() => setShowSaveForm(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveForm(true)}
              className="riq-btn riq-btn-secondary"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <IconDeviceFloppy size={14} /> Save current weights as preset
            </button>
          )}
        </div>
      </div>
    </>
  );
}
