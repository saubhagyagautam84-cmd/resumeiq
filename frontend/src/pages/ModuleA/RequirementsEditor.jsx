import { useState } from "react";
import ErrorAlert from "../../components/ErrorAlert";

const EDUCATION_LEVELS = ["", "high_school", "associate", "diploma", "bachelors", "masters", "phd"];

/**
 * Step 2 — recruiter reviews and edits the auto-extracted JD requirements
 * before the scoring weights are configured.
 */
export default function RequirementsEditor({ job, onSaved }) {
  const req = job.requirements || {};

  const [title, setTitle] = useState(req.title || job.title || "");
  const [minExp, setMinExp] = useState(req.min_experience_years ?? 0);
  const [eduLevel, setEduLevel] = useState(req.education_level || "");
  const [eduField, setEduField] = useState(req.education_field || "");
  const [requiredSkills, setRequiredSkills] = useState(
    (req.required_skills || []).join(", ")
  );
  const [preferredSkills, setPreferredSkills] = useState(
    (req.preferred_skills || []).join(", ")
  );
  const [requiredCerts, setRequiredCerts] = useState(
    (req.required_certifications || []).join(", ")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function splitCsv(s) {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    if (minExp < 0 || minExp > 50) {
      return setError("Min experience must be between 0 and 50 years.");
    }

    const requirements = {
      title: title.trim(),
      required_skills: splitCsv(requiredSkills),
      preferred_skills: splitCsv(preferredSkills),
      min_experience_years: parseFloat(minExp) || 0,
      education_level: eduLevel,
      education_field: eduField.trim(),
      required_certifications: splitCsv(requiredCerts),
      description: req.description || "",
    };

    setLoading(true);
    setError("");
    try {
      const { jobs: jobsApi } = await import("../../services/api");
      const updated = await jobsApi.updateRequirements(job.id, { requirements });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h2 className="section-title">Review Extracted Requirements</h2>
        <p className="text-sm text-gray-500">
          These were auto-extracted from your JD. Edit anything that looks wrong before scoring.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Job Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="label">Min Experience (years)</label>
          <input
            type="number"
            min="0" max="50" step="0.5"
            className="input"
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Required Education Level</label>
          <select
            className="input"
            value={eduLevel}
            onChange={(e) => setEduLevel(e.target.value)}
          >
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{l || "Not specified"}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Education Field</label>
          <input
            className="input"
            placeholder="e.g. Computer Science, Engineering"
            value={eduField}
            onChange={(e) => setEduField(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="label">Required Skills <span className="text-gray-400">(comma-separated)</span></label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Python, TensorFlow, AWS, Machine Learning"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="label">Preferred Skills <span className="text-gray-400">(comma-separated)</span></label>
          <textarea
            className="input min-h-[60px]"
            placeholder="Kubernetes, Spark"
            value={preferredSkills}
            onChange={(e) => setPreferredSkills(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="label">Required Certifications <span className="text-gray-400">(comma-separated, leave blank if none)</span></label>
          <input
            className="input"
            placeholder="AWS Solutions Architect, PMP"
            value={requiredCerts}
            onChange={(e) => setRequiredCerts(e.target.value)}
          />
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <div className="flex gap-3">
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save & Configure Weights →"}
        </button>
      </div>
    </div>
  );
}
