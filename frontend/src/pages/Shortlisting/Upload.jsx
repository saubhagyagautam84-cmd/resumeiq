import { useState, useRef } from "react";
import { IconCloudUpload, IconFileCheck, IconAlertTriangle, IconX, IconUserSearch } from "@tabler/icons-react";

// Mock duplicate detection: check if filename contains known names
const KNOWN_APPLICANTS = {
  amir:   { name: "Amir Khan",    posting: "Product designer",    date: "Mar 3" },
  priya:  { name: "Priya Shah",   posting: "Frontend engineer",   date: "Feb 18" },
  jordan: { name: "Jordan Diaz",  posting: "Support specialist",  date: "Jan 27" },
};

function detectDuplicate(filename) {
  const lower = filename.toLowerCase();
  for (const [key, val] of Object.entries(KNOWN_APPLICANTS)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export default function Upload({ jobId, onNext }) {
  const [files,      setFiles]      = useState([]);
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [drag,       setDrag]       = useState(false);
  const [error,      setError]      = useState("");
  const inputRef = useRef(null);

  function addFiles(incoming) {
    const accepted = Array.from(incoming).filter(f =>
      f.name.endsWith(".pdf") || f.name.endsWith(".docx")
    );
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...accepted.filter(f => !names.has(f.name))];
    });
  }

  function removeFile(name) { setFiles(f => f.filter(f => f.name !== name)); }

  async function upload() {
    if (!jobId) { setError("No active job — complete JD input first."); return; }
    if (!files.length) { setError("Add at least one resume file."); return; }
    setLoading(true); setError("");
    try {
      const { candidates } = await import("../../services/api");
      const res = await candidates.upload(jobId, files);
      setResults(res);
      if (res.every(r => r.status === "ok")) onNext();
    } catch (err) {
      setError(err.message ?? "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconCloudUpload size={18} color="#0C447C" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Upload resumes</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>PDF or DOCX files only. Up to 20 at a time.</div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        aria-label="Click or drag to upload resume files"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${drag ? "#7F77DD" : "#C8C7C3"}`,
          borderRadius: 10, padding: "32px 20px",
          textAlign: "center", cursor: "pointer",
          background: drag ? "#EEEDFE" : "#FAFAF9",
          transition: "all 0.15s",
        }}
      >
        <IconCloudUpload size={28} color={drag ? "#7F77DD" : "#9B9A97"} style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 14, color: drag ? "#26215C" : "#5F5E5A", fontWeight: 500 }}>
          {drag ? "Drop files here" : "Drag & drop resumes, or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: "#9B9A97", marginTop: 4 }}>PDF or DOCX</div>
        <input ref={inputRef} type="file" multiple accept=".pdf,.docx" style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map(f => {
            const res  = results.find(r => r.filename === f.name);
            const dup  = detectDuplicate(f.name);
            const isDup = !!dup && !res; // only show if not yet processed

            if (isDup) {
              return (
                <div key={f.name} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px", borderRadius: 8,
                  background: "#FAEEDA", border: "1px solid #E8D5A0",
                }}>
                  <IconUserSearch size={16} color="#BA7517" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#633806", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#633806", marginTop: 2 }}>
                      Possible duplicate — {dup.name} applied to &ldquo;{dup.posting}&rdquo; on {dup.date}.{" "}
                      <a href="#" onClick={e => e.preventDefault()} style={{ color: "#3C3489", fontWeight: 500 }}>
                        View previous application
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(f.name)}
                    aria-label={`Remove ${f.name}`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#BA7517" }}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              );
            }

            return (
              <div key={f.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8,
                background: res?.status === "error" ? "#FCEBEB" : "#F8F8F6",
                border: "1px solid", borderColor: res?.status === "error" ? "#F0C4C4" : "#E8E7E2",
              }}>
                {res?.status === "ok"
                  ? <IconFileCheck size={15} color="#1D9E75" />
                  : res?.status === "error"
                  ? <IconAlertTriangle size={15} color="#D85A30" />
                  : <IconFileCheck size={15} color="#9B9A97" />
                }
                <span style={{ flex: 1, fontSize: 13, color: "#26215C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.name}
                </span>
                {res?.error && <span style={{ fontSize: 11, color: "#791F1F", flexShrink: 0 }}>{res.error}</span>}
                {!res && (
                  <button
                    onClick={() => removeFile(f.name)}
                    aria-label={`Remove ${f.name}`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9B9A97" }}
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p style={{ color: "#D85A30", fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="riq-btn riq-btn-primary"
          onClick={upload}
          disabled={loading || !files.length}
        >
          {loading ? "Uploading…" : `Upload ${files.length ? `${files.length} file${files.length > 1 ? "s" : ""}` : "files"}`}
        </button>
        {results.length > 0 && (
          <button className="riq-btn riq-btn-secondary" onClick={onNext}>
            View results →
          </button>
        )}
      </div>
    </div>
  );
}
