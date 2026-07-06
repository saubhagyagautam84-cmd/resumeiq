import { useState } from "react";
import ErrorAlert from "../../components/ErrorAlert";

/**
 * Export panel — PDF or DOCX, with self-test warnings shown before download.
 */
export default function ExportPanel({ resumeId }) {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("pdf");
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  async function handleExport() {
    if (!resumeId) return setError("Save your resume first.");
    setLoading(true);
    setError("");
    setWarnings([]);

    try {
      const { builder } = await import("../../services/api");
      const { blob, warnings: w } = await builder.exportResume(resumeId, format);

      if (w) setWarnings(w.split(";").map((s) => s.trim()).filter(Boolean));

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Export Resume</h3>
      <p className="text-xs text-gray-500">
        ATS-safe output — single column, no tables or graphics. A self-test runs automatically after generation.
      </p>

      <div className="flex gap-3">
        {["pdf", "docx"].map((f) => (
          <label key={f} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer text-sm transition-colors ${
            format === f ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"
          }`}>
            <input
              type="radio"
              name="format"
              value={f}
              checked={format === f}
              onChange={() => setFormat(f)}
              className="accent-blue-600"
            />
            {f.toUpperCase()}
          </label>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-700">Self-test warnings — your resume downloaded, but check these:</p>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded">⚠️ {w}</p>
          ))}
        </div>
      )}

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <button className="btn-primary" onClick={handleExport} disabled={loading || !resumeId}>
        {loading ? "Generating…" : `Download ${format.toUpperCase()}`}
      </button>
    </div>
  );
}
