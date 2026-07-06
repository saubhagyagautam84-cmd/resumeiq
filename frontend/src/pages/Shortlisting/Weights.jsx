import { useState } from "react";
import { IconAdjustments, IconSettings } from "@tabler/icons-react";
import ScoringPresets from "./ScoringPresets";

const INITIAL_WEIGHTS = {
  education:      0.15,
  experience:     0.30,
  skills:         0.30,
  projects:       0.10,
  certifications: 0.10,
  extras:         0.05,
};

const LABELS = {
  education:      "Education",
  experience:     "Experience",
  skills:         "Skills match",
  projects:       "Projects",
  certifications: "Certifications",
  extras:         "Extras / profile",
};

function pct(v) { return Math.round(v * 100); }

export default function Weights({ jobId, currentWeights, onWeightsChange, onNext }) {
  const [weights,      setWeights]      = useState(currentWeights ?? { ...INITIAL_WEIGHTS });
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [showPresets,  setShowPresets]  = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = Math.abs(total - 1.0) < 0.005;

  function onChange(key, rawPct) {
    const val = Math.max(0, Math.min(100, parseInt(rawPct, 10) || 0)) / 100;
    const next = { ...weights, [key]: val };
    setWeights(next);
    onWeightsChange?.(next);
  }

  function applyPreset(presetWeights) {
    setWeights(presetWeights);
    onWeightsChange?.(presetWeights);
    setShowPresets(false);
  }

  async function save() {
    if (!valid) { setError("Weights must sum to 100%."); return; }
    if (!jobId) { onNext(); return; }
    setSaving(true); setError("");
    try {
      const { jobs } = await import("../../services/api");
      await jobs.updateWeights(jobId, weights);
      onNext();
    } catch (err) {
      setError(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconAdjustments size={18} color="#1D9E75" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Scoring weights</div>
            <div style={{ fontSize: 12, color: "#5F5E5A" }}>Adjust how much each section contributes. Must total 100%.</div>
          </div>
        </div>
        <button
          onClick={() => setShowPresets(true)}
          aria-label="Open scoring presets"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "#F2F2EF", border: "none",
            padding: "7px 12px", borderRadius: 8,
            fontSize: 12, color: "#5F5E5A",
            cursor: "pointer", fontFamily: "inherit",
          }}
          title="Saved presets"
        >
          <IconSettings size={14} /> Presets
        </button>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {Object.keys(INITIAL_WEIGHTS).map(key => {
          const val = pct(weights[key] ?? 0);
          return (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#26215C" }}>{LABELS[key]}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <input
                    type="number" min={0} max={100} step={1}
                    value={val}
                    onChange={e => onChange(key, e.target.value)}
                    aria-label={`${LABELS[key]} weight percentage`}
                    style={{
                      width: 52, textAlign: "right",
                      border: "1.5px solid #E8E7E2", borderRadius: 6,
                      padding: "3px 6px", fontSize: 13, fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#5F5E5A" }}>%</span>
                </div>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={val}
                onChange={e => onChange(key, e.target.value)}
                aria-label={`${LABELS[key]} weight slider`}
              />
            </div>
          );
        })}
      </div>

      {/* Total indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 8,
        background: valid ? "#E1F5EE" : "#FCEBEB",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: valid ? "#085041" : "#791F1F" }}>
          Total: {Math.round(total * 100)}%
        </span>
        <span style={{ fontSize: 12, color: valid ? "#0F6E56" : "#993C1D" }}>
          {valid
            ? "✓ Looks good"
            : `— ${Math.round((1 - total) * 100) > 0 ? "+" : ""}${Math.round((1 - total) * 100)}% to reach 100%`}
        </span>
      </div>

      {error && <p style={{ color: "#D85A30", fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="riq-btn riq-btn-primary" onClick={save} disabled={saving || !valid}>
          {saving ? "Saving…" : "Save & continue →"}
        </button>
      </div>

      {/* Presets modal */}
      {showPresets && (
        <ScoringPresets
          currentWeights={weights}
          onApply={applyPreset}
          onClose={() => setShowPresets(false)}
        />
      )}
    </div>
  );
}
