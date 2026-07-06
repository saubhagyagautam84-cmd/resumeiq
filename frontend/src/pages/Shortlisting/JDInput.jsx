import { useState } from "react";
import { IconFileText } from "@tabler/icons-react";

export default function JDInput({ onNext }) {
  const [title,   setTitle]   = useState("");
  const [jd,      setJd]      = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit() {
    if (!title.trim() || !jd.trim()) { setError("Both fields are required."); return; }
    setLoading(true); setError("");
    try {
      const { jobs } = await import("../../services/api");
      const job = await jobs.create({ title, jd_text: jd });
      onNext(job);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#EEEDFE",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconFileText size={18} color="#7F77DD" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Paste job description</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>We'll extract skills, experience, and education requirements automatically.</div>
        </div>
      </div>

      <div>
        <label className="riq-label">
          Job title <span style={{ color: "#D85A30" }}>*</span>
        </label>
        <input
          className="riq-input"
          placeholder="e.g. Senior Data Scientist"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="riq-label">
          Job description <span style={{ color: "#D85A30" }}>*</span>
        </label>
        <textarea
          className="riq-input"
          style={{ minHeight: 200 }}
          placeholder="Paste the full job description here…"
          value={jd}
          onChange={e => setJd(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "#D85A30", fontSize: 13, margin: 0 }}>{error}</p>}

      <div>
        <button
          className="riq-btn riq-btn-primary"
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !jd.trim()}
        >
          {loading ? "Parsing…" : "Parse JD →"}
        </button>
      </div>
    </div>
  );
}
