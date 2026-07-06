import { useState, useEffect } from "react";
import { IconTrophy, IconDownload, IconChevronDown, IconChevronUp, IconLayoutKanban, IconList } from "@tabler/icons-react";
import Avatar from "../../components/Avatar";
import ScorePill from "../../components/ScorePill";
import Tag from "../../components/Tag";
import CandidateDetail from "./CandidateDetail";
import ComparePanel from "./ComparePanel";
import PipelineBoard, { PIPELINE_STAGES } from "./PipelineBoard";

const DEMO = [
  {
    id: 1, name: "Priya Shah", rank: 1, score: 91,
    experience_years: 5, status: "Screening",
    skills: ["Python", "PyTorch", "AWS", "SQL", "MLflow"],
    summary: "Senior data scientist with 5 years building ML pipelines. Experienced with Python, PyTorch and AWS SageMaker. Led a team of 4 engineers to reduce model latency by 40%.",
    breakdown: { education: 85, experience: 95, skills: 92, projects: 88, certifications: 90, extras: 80 },
    education: "M.Sc. Computer Science",
  },
  {
    id: 2, name: "Amir Khan", rank: 2, score: 73,
    experience_years: 3, status: "New",
    skills: ["Python", "Scikit-learn", "Pandas", "SQL"],
    summary: "Data analyst with 3 years experience. Proficient in Python and Scikit-learn. Missing AWS cloud and deep-learning experience.",
    breakdown: { education: 70, experience: 72, skills: 75, projects: 68, certifications: 65, extras: 70 },
    education: "B.Sc. Statistics",
  },
  {
    id: 3, name: "Jordan Diaz", rank: 3, score: 44,
    experience_years: 1, status: "New",
    skills: ["R", "Excel", "Tableau"],
    summary: "Entry-level analyst, 1 year experience. Strong in R and visualization but missing core ML skills required for this role.",
    breakdown: { education: 60, experience: 35, skills: 40, projects: 30, certifications: 20, extras: 55 },
    education: "B.A. Business",
  },
];

const STAGE_DOT = {
  New:       "#9B9A97",
  Screening: "#0C447C",
  Interview: "#BA7517",
  Offer:     "#1D9E75",
  Hired:     "#27500A",
  Rejected:  "#D85A30",
};

// Mock duplicate map: filenames matching these patterns trigger a duplicate notice
const MOCK_DUPLICATES = {
  "amir": { name: "Amir Khan", posting: "Product designer", date: "Mar 3" },
};

export default function Results({ jobId }) {
  const [rows,       setRows]       = useState(DEMO);
  const [expanded,   setExpanded]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [minScore,   setMinScore]   = useState(0);
  const [viewMode,   setViewMode]   = useState("list");    // "list" | "pipeline"
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detail,     setDetail]     = useState(null);      // candidate | null
  const [showCompare, setShowCompare] = useState(false);

  // Demo JD requirements for matched/missing display
  const demoJdReqs = {
    required_skills:  ["Python", "PyTorch", "AWS", "SQL"],
    preferred_skills: ["MLflow", "Kubernetes", "Spark"],
  };

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    import("../../services/api").then(({ scoring }) =>
      scoring.results(jobId)
        .then(data => { if (data?.length) setRows(data); })
        .catch(() => {})
        .finally(() => setLoading(false))
    );
  }, [jobId]);

  function setStatus(id, status) {
    setRows(r => r.map(c => c.id === id ? { ...c, status } : c));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  const filtered      = rows.filter(c => (c.score ?? 0) >= minScore);
  const selectedRows  = rows.filter(c => selectedIds.has(c.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Top controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconTrophy size={18} color="#BA7517" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Ranked results</div>
            <div style={{ fontSize: 12, color: "#5F5E5A" }}>
              {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}{minScore > 0 ? ` · score ≥ ${minScore}%` : ""}
            </div>
          </div>
        </div>

        {/* Min score filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#5F5E5A" }} htmlFor="min-score">Min score</label>
          <input
            id="min-score"
            type="range" min={0} max={100} step={5} value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            style={{ width: 90 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#26215C", minWidth: 32 }}>{minScore}%</span>
        </div>

        {/* CSV export */}
        {jobId && (
          <a
            href={`/api/jobs/${jobId}/results/csv`} download
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "#EEEDFE", color: "#26215C", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
          >
            <IconDownload size={14} /> Export CSV
          </a>
        )}

        {/* View mode toggle */}
        <div style={{ display: "flex", background: "#F2F2EF", borderRadius: 8, padding: 3, gap: 2 }}>
          {[
            { id: "list",     Icon: IconList,          label: "List" },
            { id: "pipeline", Icon: IconLayoutKanban,   label: "Pipeline" },
          ].map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              aria-label={`Switch to ${label} view`}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 6,
                background: viewMode === id ? "#fff" : "transparent",
                border: "none",
                boxShadow: viewMode === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                color: viewMode === id ? "#26215C" : "#9B9A97",
                fontSize: 13, fontWeight: viewMode === id ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: "#5F5E5A", fontSize: 13 }}>Loading results…</p>}

      {/* ── Pipeline view ── */}
      {viewMode === "pipeline" && (
        <PipelineBoard
          candidates={filtered}
          onUpdate={updated => setRows(updated)}
        />
      )}

      {/* ── List view ── */}
      {viewMode === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(c => (
            <CandidateRow
              key={c.id}
              candidate={c}
              expanded={expanded === c.id}
              selected={selectedIds.has(c.id)}
              selectable={selectedIds.size < 4 || selectedIds.has(c.id)}
              onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              onSelect={() => toggleSelect(c.id)}
              onStatusChange={s => setStatus(c.id, s)}
              onOpenDetail={() => setDetail(c)}
            />
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9B9A97", fontSize: 14 }}>
              No candidates match the current filter.
            </div>
          )}
        </div>
      )}

      {/* ── Floating compare action bar ── */}
      {selectedIds.size >= 2 && viewMode === "list" && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#26215C", color: "#fff",
          padding: "12px 24px", borderRadius: 40,
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 24px rgba(38,33,92,0.35)",
          zIndex: 50,
        }}>
          <span style={{ fontSize: 13 }}>
            {selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setShowCompare(true)}
            style={{ background: "#7F77DD", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Compare ({selectedIds.size}) →
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
            style={{ background: "none", border: "none", color: "#9B9A97", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Candidate detail modal ── */}
      {detail && (
        <CandidateDetail
          candidate={detail}
          jobRequirements={demoJdReqs}
          onClose={() => setDetail(null)}
          onStatusChange={s => { setStatus(detail.id, s); setDetail(null); }}
        />
      )}

      {/* ── Compare panel modal ── */}
      {showCompare && (
        <ComparePanel
          candidates={selectedRows}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

/* ── Candidate row ─────────────────────────────────────────────── */
function CandidateRow({ candidate: c, expanded, selected, selectable, onToggle, onSelect, onStatusChange, onOpenDetail }) {
  return (
    <div style={{ border: "1.5px solid #E8E7E2", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}>
        {/* Compare checkbox */}
        <input
          type="checkbox"
          checked={selected}
          disabled={!selectable && !selected}
          onChange={onSelect}
          aria-label={`Select ${c.name} for comparison`}
          style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#7F77DD", flexShrink: 0 }}
        />

        {/* Rank badge */}
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: c.rank === 1 ? "#FAEEDA" : "#F2F2EF",
          color: c.rank === 1 ? "#633806" : "#5F5E5A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>
          {c.rank === 1 ? "★" : c.rank ?? "—"}
        </div>

        <Avatar name={c.name} size={32} />

        {/* Name + exp — click to open detail */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
          onClick={onOpenDetail}
        >
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.name}
          </div>
          <div style={{ fontSize: 11, color: "#5F5E5A" }}>
            {c.experience_years ?? "?"} yr{c.experience_years !== 1 ? "s" : ""} exp
          </div>
        </div>

        {/* Skill tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 200 }}>
          {(c.skills ?? []).slice(0, 2).map((s, i) => (
            <Tag key={s} label={s} variant={["teal", "blue"][i % 2]} />
          ))}
        </div>

        <ScorePill score={c.score} />

        {/* Stage: dot + dropdown */}
        <StagePicker stage={c.status ?? "New"} onChange={onStatusChange} />

        {/* Expand / collapse */}
        <button
          onClick={onToggle}
          aria-label={expanded ? "Collapse" : "Expand"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 3, color: "#9B9A97" }}
        >
          {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded breakdown */}
      {expanded && c.breakdown && (
        <div style={{ borderTop: "1px solid #F0F0ED", padding: "12px 14px", background: "#FAFAF9" }}>
          <p style={{ fontSize: 12, color: "#5F5E5A", margin: "0 0 10px 0" }}>{c.summary ?? c.plain_summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
            {Object.entries(c.breakdown).map(([k, v]) => (
              <BreakdownBar key={k} label={k} value={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StagePicker({ stage, onChange }) {
  const dot = STAGE_DOT[stage] ?? "#9B9A97";
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      <select
        value={stage}
        onChange={e => { e.stopPropagation(); onChange(e.target.value); }}
        onClick={e => e.stopPropagation()}
        aria-label="Change stage"
        style={{
          border: "none", background: "transparent",
          fontSize: 12, fontWeight: 500, color: "#26215C",
          cursor: "pointer", outline: "none",
          fontFamily: "inherit", appearance: "none",
          paddingRight: 14,
        }}
      >
        {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <span style={{ position: "absolute", right: 0, pointerEvents: "none", fontSize: 9, color: "#9B9A97" }}>▾</span>
    </div>
  );
}

function BreakdownBar({ label, value }) {
  const pct   = Math.round(value ?? 0);
  const color = pct >= 75 ? "#1D9E75" : pct >= 50 ? "#BA7517" : "#D85A30";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#5F5E5A", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "#E8E7E2" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}
