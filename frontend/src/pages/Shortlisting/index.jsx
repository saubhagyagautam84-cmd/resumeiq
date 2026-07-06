import { useState } from "react";
import Chip from "../../components/Chip";
import JDInput       from "./JDInput";
import Requirements  from "./Requirements";
import Weights       from "./Weights";
import Upload        from "./Upload";
import Results       from "./Results";
import BiasAudit     from "./BiasAudit";

const SUB_TABS = [
  { id: "jd",           label: "1 · JD input" },
  { id: "requirements", label: "2 · Requirements" },
  { id: "weights",      label: "3 · Weights" },
  { id: "upload",       label: "4 · Upload" },
  { id: "results",      label: "5 · Results" },
  { id: "bias",         label: "6 · Bias audit" },
];

export default function Shortlisting() {
  const [sub,     setSub]     = useState("jd");
  const [jobId,   setJobId]   = useState(null);
  const [jobData, setJobData] = useState(null);
  const [weights, setWeights] = useState(null); // shared between Weights sub-panel and presets

  function handleJobCreated(data) {
    setJobId(data.id);
    setJobData(data);
    setSub("requirements");
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 14px" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontSize: "clamp(17px, 4vw, 20px)", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #26215C 0%, #7F77DD 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Resume shortlisting</h2>
        <p style={{ fontSize: 13, color: "#71717A", margin: "4px 0 0 0" }}>
          Paste a JD, set weights, and rank resumes automatically.
        </p>
      </div>

      {/* Sub-tab chips — horizontal scroll, hidden scrollbar */}
      <div className="riq-scroll-x" style={{ display: "flex", gap: 7, marginBottom: 16, paddingBottom: 2 }}>
        {SUB_TABS.map(t => (
          <Chip key={t.id} label={t.label} active={sub === t.id} onClick={() => setSub(t.id)} />
        ))}
      </div>

      {/* Panel card */}
      <div className="riq-card" style={{ padding: "clamp(14px, 4vw, 28px)" }}>
        {sub === "jd"           && <JDInput       onNext={handleJobCreated} />}
        {sub === "requirements" && <Requirements  jobId={jobId} jobData={jobData} onNext={() => setSub("weights")} />}
        {sub === "weights"      && <Weights       jobId={jobId} currentWeights={weights} onWeightsChange={setWeights} onNext={() => setSub("upload")} />}
        {sub === "upload"       && <Upload        jobId={jobId} onNext={() => setSub("results")} />}
        {sub === "results"      && <Results       jobId={jobId} />}
        {sub === "bias"         && <BiasAudit />}
      </div>
    </div>
  );
}
