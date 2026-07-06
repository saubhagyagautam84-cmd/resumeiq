import { useState } from "react";
import { IconX, IconMail, IconCheck, IconBan, IconArrowRight } from "@tabler/icons-react";
import Avatar from "../../components/Avatar";
import ScorePill from "../../components/ScorePill";
import Tag from "../../components/Tag";
import EmailComposer from "./EmailComposer";

function HighlightedText({ text, keywords }) {
  if (!text) return <p style={{ fontSize: 13, color: "#9B9A97" }}>No summary available.</p>;
  if (!keywords.length) return <p style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.7 }}>{text}</p>;

  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <p style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.7, margin: 0 }}>
      {parts.map((part, i) => {
        const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
        return isMatch
          ? <mark key={i} style={{ background: "#EAF3DE", color: "#27500A", borderRadius: 3, padding: "0 2px" }}>{part}</mark>
          : part;
      })}
    </p>
  );
}

function BreakdownRow({ label, value }) {
  const pct = Math.round(value ?? 0);
  const color = pct >= 75 ? "#1D9E75" : pct >= 50 ? "#BA7517" : "#D85A30";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#5F5E5A", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#E8E7E2", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export default function CandidateDetail({ candidate, jobRequirements, onClose, onStatusChange }) {
  const [showEmail, setShowEmail] = useState(false);

  const reqSkills  = jobRequirements?.required_skills  ?? [];
  const prefSkills = jobRequirements?.preferred_skills ?? [];
  const allRequired = [...new Set([...reqSkills, ...prefSkills])];
  const candSkills  = candidate.skills ?? [];

  function skillMatch(req, cands) {
    return cands.some(cs =>
      cs.toLowerCase().includes(req.toLowerCase()) ||
      req.toLowerCase().includes(cs.toLowerCase())
    );
  }

  const matched = allRequired.filter(s => skillMatch(s, candSkills));
  const missing  = allRequired.filter(s => !skillMatch(s, candSkills));

  const resumeText = candidate.summary ?? candidate.plain_summary ?? "";

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        aria-label="Close candidate detail"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Candidate: ${candidate.name}`}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(720px, 95vw)", maxHeight: "86vh",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          zIndex: 201, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #E8E7E2" }}>
          <Avatar name={candidate.name} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#26215C" }}>{candidate.name}</div>
            <div style={{ fontSize: 12, color: "#5F5E5A" }}>
              {candidate.experience_years ?? "?"} yr{candidate.experience_years !== 1 ? "s" : ""} experience
              {candidate.status ? ` · ${candidate.status}` : ""}
            </div>
          </div>
          <ScorePill score={candidate.score} />
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 4 }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {/* Matched vs Missing */}
          {allRequired.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 14, background: "#F4FAF2", borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#27500A", marginBottom: 8 }}>
                  <IconCheck size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Matched ({matched.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {matched.length > 0
                    ? matched.map(s => <Tag key={s} label={s} variant="teal" />)
                    : <span style={{ fontSize: 12, color: "#9B9A97" }}>None matched</span>}
                </div>
              </div>
              <div style={{ padding: 14, background: "#FDF3F0", borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#712B13", marginBottom: 8 }}>
                  <IconBan size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Missing ({missing.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {missing.length > 0
                    ? missing.map(s => <Tag key={s} label={s} variant="coral" />)
                    : <span style={{ fontSize: 12, color: "#27500A" }}>All requirements met ✓</span>}
                </div>
              </div>
            </div>
          )}

          {/* Score breakdown */}
          {candidate.breakdown && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 10 }}>Score breakdown</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {Object.entries(candidate.breakdown).map(([k, v]) => (
                  <BreakdownRow key={k} label={k} value={v} />
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(candidate.skills ?? []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 8 }}>Skills on resume</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {candidate.skills.map((s, i) => <Tag key={s} label={s} variant={["blue", "purple", "amber", "teal", "pink"][i % 5]} />)}
              </div>
            </div>
          )}

          {/* Summary with keyword highlights */}
          {resumeText && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 8 }}>Summary</div>
              <HighlightedText text={resumeText} keywords={matched} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderTop: "1px solid #E8E7E2", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowEmail(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "1.5px solid #E8E7E2",
              padding: "7px 14px", borderRadius: 8,
              fontSize: 13, color: "#5F5E5A", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <IconMail size={14} /> Send email
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => { onStatusChange?.("Rejected"); onClose(); }}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #D85A30", color: "#D85A30", background: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Reject
          </button>
          <button
            onClick={() => { onStatusChange?.("Shortlisted"); onClose(); }}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #1D9E75", color: "#1D9E75", background: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Shortlist
          </button>
          <button
            onClick={() => { onStatusChange?.("Interview"); onClose(); }}
            className="riq-btn riq-btn-primary"
            style={{ padding: "7px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}
          >
            <IconArrowRight size={14} /> Move to interview
          </button>
        </div>
      </div>

      {showEmail && (
        <EmailComposer candidate={candidate} onClose={() => setShowEmail(false)} />
      )}
    </>
  );
}
