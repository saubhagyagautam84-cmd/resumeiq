import { useState, useRef } from "react";
import ErrorAlert from "../../components/ErrorAlert";
import Spinner from "../../components/Spinner";

/**
 * Step 4 — drag-and-drop + file picker for batch PDF/DOCX upload.
 * Shows per-file parse failures without crashing the entire batch.
 */
export default function ResumeUpload({ job, onScored }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function addFiles(newFiles) {
    const valid = Array.from(newFiles).filter((f) => {
      const ext = f.name.toLowerCase();
      return ext.endsWith(".pdf") || ext.endsWith(".docx");
    });
    if (valid.length < newFiles.length) {
      setError("Some files were skipped — only PDF and DOCX are accepted.");
    }
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  }

  function removeFile(name) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function handleUploadAndScore() {
    if (files.length === 0) return setError("Please select at least one resume file.");
    setError("");
    setUploading(true);
    setUploadResult(null);

    let result;
    try {
      const { candidates: candidatesApi } = await import("../../services/api");
      result = await candidatesApi.upload(job.id, files);
      setUploadResult(result);
    } catch (err) {
      setError(err.message);
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }

    if (result.succeeded === 0) {
      setError("All files failed to parse. Check the failure details below.");
      return;
    }

    // Automatically run scoring
    setScoring(true);
    try {
      const { scoring: scoringApi } = await import("../../services/api");
      await scoringApi.run(job.id);
      onScored();
    } catch (err) {
      setError(`Upload succeeded but scoring failed: ${err.message}`);
    } finally {
      setScoring(false);
    }
  }

  if (uploading) return <Spinner label={`Parsing ${files.length} resume(s)…`} />;
  if (scoring) return <Spinner label="Scoring candidates…" />;

  return (
    <div className="card p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="section-title">Upload Resumes</h2>
        <p className="text-sm text-gray-500">PDF and DOCX accepted. Upload multiple files at once.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-4xl mb-3">📎</div>
        <p className="text-sm font-medium text-gray-700">Drop resumes here, or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">PDF or DOCX — multiple files OK</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg"
            >
              <span className="truncate flex-1">{f.name}</span>
              <span className="text-xs text-gray-400 ml-3">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => removeFile(f.name)}
                className="ml-3 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Parse failures from previous upload */}
      {uploadResult?.failures?.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-700">
            {uploadResult.failed} file(s) failed to parse:
          </p>
          {uploadResult.failures.map((f) => (
            <div key={f.filename} className="text-xs px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <span className="font-medium">{f.filename}</span>: {f.error}
            </div>
          ))}
        </div>
      )}

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <button
        className="btn-primary"
        onClick={handleUploadAndScore}
        disabled={files.length === 0}
      >
        Upload &amp; Score {files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""} →
      </button>
    </div>
  );
}
