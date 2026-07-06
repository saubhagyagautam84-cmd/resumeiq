import { useState } from "react";
import ErrorAlert from "../../components/ErrorAlert";

const FACTORS = [
  { key: "education",      label: "Education",       emoji: "🎓" },
  { key: "experience",     label: "Experience",       emoji: "💼" },
  { key: "projects",       label: "Projects",         emoji: "🔨" },
  { key: "skills",         label: "Skills Match",     emoji: "⚡" },
  { key: "certifications", label: "Certifications",   emoji: "📜" },
  { key: "extras",         label: "Extras",           emoji: "✨" },
];

const DEFAULTS = {
  education: 20, experience: 25, projects: 20,
  skills: 20, certifications: 10, extras: 5,
};

/**
 * Step 3 — sliders for scoring weights, must sum to 100%.
 */
export default function WeightConfig({ job, onSaved }) {
  const stored = job.weights || {};
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(
      FACTORS.map(({ key }) => [key, Math.round((stored[key] ?? DEFAULTS[key] / 100) * 100)])
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = total === 100;

  function handleChange(key, val) {
    setWeights((prev) => ({ ...prev, [key]: Number(val) }));
  }

  function resetDefaults() {
    setWeights({ ...DEFAULTS });
  }

  async function handleSave() {
    if (!valid) return setError(`Weights must sum to 100%. Current total: ${total}%.`);

    const payload = Object.fromEntries(
      FACTORS.map(({ key }) => [key, weights[key] / 100])
    );

    setLoading(true);
    setError("");
    try {
      const { jobs: jobsApi } = await import("../../services/api");
      await jobsApi.updateWeights(job.id, payload);
      onSaved({ ...job, weights: payload });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Configure Scoring Weights</h2>
          <p className="text-sm text-gray-500">Drag sliders to adjust how each factor is weighted. Must sum to 100%.</p>
        </div>
        <button onClick={resetDefaults} className="btn-secondary text-xs">Reset defaults</button>
      </div>

      <div className="space-y-4">
        {FACTORS.map(({ key, label, emoji }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                {emoji} {label}
              </label>
              <span className={`text-sm font-bold w-10 text-right ${weights[key] === 0 ? "text-gray-400" : "text-blue-600"}`}>
                {weights[key]}%
              </span>
            </div>
            <input
              type="range"
              min="0" max="100" step="5"
              value={weights[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
        ))}
      </div>

      {/* Total indicator */}
      <div className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
        valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}>
        <span>Total</span>
        <span>{total}% {valid ? "✓" : `— ${total > 100 ? "reduce" : "increase"} by ${Math.abs(100 - total)}%`}</span>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <button className="btn-primary" onClick={handleSave} disabled={loading || !valid}>
        {loading ? "Saving…" : "Save Weights & Upload Resumes →"}
      </button>
    </div>
  );
}
