import { useState } from "react";
import ErrorAlert from "../../components/ErrorAlert";

/**
 * Step 1 — recruiter pastes or uploads a JD, gives the job a title.
 */
export default function JDInput({ onCreated }) {
  const [title, setTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError("Please enter a job title.");
    if (jdText.trim().length < 50)
      return setError("Job description is too short (minimum 50 characters).");

    setLoading(true);
    setError("");
    try {
      const { jobs } = await import("../../services/api");
      const result = await jobs.create({ title: title.trim(), jd_text: jdText.trim() });
      onCreated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("JD file must be under 2 MB.");
      return;
    }
    const text = await file.text().catch(() => {
      setError("Could not read the uploaded file.");
      return "";
    });
    if (text) setJdText(text);
    e.target.value = "";
  }

  return (
    <div className="card p-6 max-w-3xl mx-auto">
      <h2 className="section-title">New Job Posting</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="job-title">Job Title</label>
          <input
            id="job-title"
            className="input"
            placeholder="e.g. Senior Machine Learning Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0" htmlFor="jd-text">Job Description</label>
            <label className="cursor-pointer text-xs text-blue-600 hover:underline">
              Upload .txt file
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <textarea
            id="jd-text"
            className="input min-h-[280px] font-mono text-xs"
            placeholder="Paste the full job description here…"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            {jdText.trim().length} characters · The system will auto-extract requirements for you to review.
          </p>
        </div>

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating…" : "Create Job & Extract Requirements →"}
        </button>
      </form>
    </div>
  );
}
