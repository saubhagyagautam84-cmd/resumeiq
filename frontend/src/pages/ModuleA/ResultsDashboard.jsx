import { useState, useEffect } from "react";
import ScoreBar from "../../components/ScoreBar";
import Spinner from "../../components/Spinner";
import ErrorAlert from "../../components/ErrorAlert";

const STATUS_CONFIG = {
  New:        { color: "bg-blue-100 text-blue-700",   dot: "bg-blue-400" },
  Reviewed:   { color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  Shortlisted:{ color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  Rejected:   { color: "bg-red-100 text-red-600",     dot: "bg-red-400" },
};

const FACTOR_LABELS = {
  education: "🎓 Education", experience: "💼 Experience", projects: "🔨 Projects",
  skills: "⚡ Skills", certifications: "📜 Certs", extras: "✨ Extras",
};

export default function ResultsDashboard({ jobId, onBack }) {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [statuses, setStatuses]     = useState({});   // candidateId → status
  const [selected, setSelected]     = useState(new Set());
  const [expanded, setExpanded]     = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [mode, setMode]             = useState("grid");  // "grid" | "compare"
  const [exporting, setExporting]   = useState(false);

  // ── Filters ──
  const [filterScore, setFilterScore] = useState(0);
  const [filterExp,   setFilterExp]   = useState(0);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSkill,  setFilterSkill]  = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { scoring } = await import("../../services/api");
        const result = await scoring.results(jobId);
        setData(result);
        // Default all to "New"
        const init = {};
        result.results.forEach((r) => { init[r.candidate_id] = "New"; });
        setStatuses(init);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const { scoring } = await import("../../services/api");
      const response = await scoring.exportCsv(jobId);
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shortlist_job_${jobId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkStatus(status) {
    setStatuses((prev) => {
      const next = { ...prev };
      selected.forEach((id) => { next[id] = status; });
      return next;
    });
    setSelected(new Set());
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  if (loading) return <Spinner label="Loading results…" />;
  if (error)   return <ErrorAlert message={error} />;
  if (!data)   return null;

  const { results, bias_audit } = data;

  // ── Filter logic ──
  const filtered = results.filter((r) => {
    if (r.total_score < filterScore) return false;
    const exp = r.breakdown?.experience?.details?.total_years ?? 0;
    if (exp < filterExp) return false;
    if (filterStatus !== "All" && statuses[r.candidate_id] !== filterStatus) return false;
    if (filterSkill) {
      const skills = (r.parsed_data?.skills || []).map((s) => s.toLowerCase());
      if (!skills.some((s) => s.includes(filterSkill.toLowerCase()))) return false;
    }
    return true;
  });

  // Unique skills across all candidates for autocomplete hint
  const allSkills = [...new Set(results.flatMap((r) => r.parsed_data?.skills || []))].sort();

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden gap-0">

      {/* ── Filter sidebar ── */}
      <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-5">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Filters</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                Min Score <span className="text-blue-600">{filterScore}+</span>
              </label>
              <input type="range" min="0" max="90" step="5" value={filterScore}
                onChange={(e) => setFilterScore(+e.target.value)}
                className="w-full accent-blue-600 mt-1" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 flex justify-between">
                Min Experience <span className="text-blue-600">{filterExp}+ yrs</span>
              </label>
              <input type="range" min="0" max="15" step="1" value={filterExp}
                onChange={(e) => setFilterExp(+e.target.value)}
                className="w-full accent-blue-600 mt-1" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
              <select className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option>All</option>
                {Object.keys(STATUS_CONFIG).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Skill contains</label>
              <input className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="e.g. Python"
                value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} />
            </div>

            <button className="text-xs text-gray-400 hover:text-blue-500"
              onClick={() => { setFilterScore(0); setFilterExp(0); setFilterStatus("All"); setFilterSkill(""); }}>
              Reset filters
            </button>
          </div>
        </div>

        {/* Bias audit */}
        {bias_audit?.graduation_year_distribution && (
          <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-700 space-y-1">
            <p className="font-semibold">⚖️ Bias Audit</p>
            <p>Grad years: {bias_audit.graduation_year_distribution.min}–{bias_audit.graduation_year_distribution.max}</p>
            <p className="text-amber-500 text-[10px]">Narrow range may introduce age bias.</p>
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-gray-800">
              {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
              {filtered.length !== results.length && <span className="text-gray-400 font-normal"> (filtered from {results.length})</span>}
            </span>
            {/* View mode */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {["grid", "compare"].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {m === "grid" ? "⊞ Grid" : "⇔ Compare"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs" onClick={handleExportCsv} disabled={exporting}>
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button className="btn-secondary text-xs" onClick={onBack}>← New Job</button>
          </div>
        </div>

        {/* ── Bulk action bar (appears when rows selected) ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
            <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <button key={s} onClick={() => bulkStatus(s)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_CONFIG[s].color}`}>
                Mark {s}
              </button>
            ))}
            <button className="text-xs text-gray-400 ml-auto hover:text-gray-600"
              onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No candidates match the current filters.</div>
          ) : mode === "compare" ? (
            <CompareView
              results={filtered}
              compareIds={compareIds}
              onToggle={toggleCompare}
              statuses={statuses}
              onStatus={(id, s) => setStatuses((p) => ({ ...p, [id]: s }))}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((r, idx) => (
                <CandidateCard
                  key={r.candidate_id}
                  rank={idx + 1}
                  result={r}
                  status={statuses[r.candidate_id] || "New"}
                  onStatus={(s) => setStatuses((p) => ({ ...p, [r.candidate_id]: s }))}
                  selected={selected.has(r.candidate_id)}
                  onSelect={() => toggleSelect(r.candidate_id)}
                  expanded={expanded === r.candidate_id}
                  onExpand={() => setExpanded(expanded === r.candidate_id ? null : r.candidate_id)}
                  inCompare={compareIds.includes(r.candidate_id)}
                  onCompare={() => toggleCompare(r.candidate_id)}
                  jdSkills={[]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Candidate card ─────────────────────────────────────────────────────────

function CandidateCard({ rank, result, status, onStatus, selected, onSelect, expanded, onExpand, inCompare, onCompare }) {
  const { name, email, total_score, breakdown, warnings, parsed_data } = result;
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  const skills = (parsed_data?.skills || []).slice(0, 5);
  const exp = breakdown?.experience?.details?.total_years;

  return (
    <div className={`card flex flex-col transition-all ${selected ? "ring-2 ring-blue-400" : ""} ${expanded ? "col-span-1" : ""}`}>
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <input type="checkbox" checked={selected} onChange={onSelect}
          className="mt-1 accent-blue-600 flex-shrink-0 cursor-pointer" />

        {/* Rank */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          rank === 1 ? "bg-yellow-400 text-yellow-900" :
          rank === 2 ? "bg-gray-300 text-gray-700" :
          rank === 3 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"
        }`}>{rank}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{name || result.filename}</div>
          {email && <div className="text-xs text-gray-400 truncate">{email}</div>}
          {exp !== undefined && (
            <div className="text-xs text-gray-500 mt-0.5">{exp.toFixed(1)} yrs exp</div>
          )}
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-xl font-bold ${
            total_score >= 70 ? "text-green-600" : total_score >= 45 ? "text-amber-500" : "text-red-500"
          }`}>{total_score.toFixed(0)}</div>
          <div className="text-[10px] text-gray-400">/ 100</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-4 pb-2">
        <ScoreBar score={total_score} size="sm" />
      </div>

      {/* Skill tags */}
      {skills.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {skills.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{s}</span>
          ))}
          {(parsed_data?.skills || []).length > 5 && (
            <span className="text-[10px] text-gray-400">+{(parsed_data.skills.length - 5)} more</span>
          )}
        </div>
      )}

      {/* Status + action row */}
      <div className="px-4 pb-3 flex items-center justify-between mt-auto">
        {/* Status dropdown */}
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value)}
          className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none ${sc.color}`}
        >
          {Object.keys(STATUS_CONFIG).map((s) => <option key={s}>{s}</option>)}
        </select>

        <div className="flex gap-1.5">
          {warnings.length > 0 && (
            <span className="badge-warning text-[10px]">⚠️ {warnings.length}</span>
          )}
          <button
            onClick={onCompare}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              inCompare ? "bg-purple-100 text-purple-700 border-purple-200" : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            {inCompare ? "✓ Compare" : "+ Compare"}
          </button>
          <button onClick={onExpand}
            className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600">
            {expanded ? "Less ▲" : "More ▼"}
          </button>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
          {/* Plain summary */}
          <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg leading-relaxed">
            {result.plain_summary}
          </p>

          {/* Warnings */}
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">⚠️ {w}</p>
          ))}

          {/* Factor bars */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(breakdown).map(([factor, d]) => (
              <div key={factor}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-gray-500">{FACTOR_LABELS[factor] || factor}</span>
                  <span className="font-semibold">{d.score.toFixed(0)}</span>
                </div>
                <ScoreBar score={d.score} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compare view (side-by-side) ────────────────────────────────────────────

function CompareView({ results, compareIds, onToggle, statuses, onStatus }) {
  const comparing = compareIds.length > 0
    ? results.filter((r) => compareIds.includes(r.candidate_id))
    : results.slice(0, 3);

  if (comparing.length < 2) {
    return (
      <div className="text-center py-12 text-gray-400 space-y-2">
        <p className="text-4xl">⇔</p>
        <p className="text-sm">Select 2–4 candidates using "+ Compare" buttons to compare them side by side.</p>
      </div>
    );
  }

  const factors = Object.keys(comparing[0]?.breakdown || {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-400 font-medium py-2 pr-4 w-28">Factor</th>
            {comparing.map((r) => (
              <th key={r.candidate_id} className="text-center pb-2 px-2">
                <div className="font-semibold text-gray-800 truncate max-w-[140px]">
                  {r.parsed_data?.name || r.filename}
                </div>
                <div className={`text-lg font-bold ${
                  r.total_score >= 70 ? "text-green-600" : r.total_score >= 45 ? "text-amber-500" : "text-red-500"
                }`}>{r.total_score.toFixed(0)}</div>
                <div className="w-24 mx-auto"><ScoreBar score={r.total_score} size="sm" /></div>
                <select
                  value={statuses[r.candidate_id] || "New"}
                  onChange={(e) => onStatus(r.candidate_id, e.target.value)}
                  className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium border-0 focus:outline-none ${STATUS_CONFIG[statuses[r.candidate_id] || "New"]?.color}`}
                >
                  {Object.keys(STATUS_CONFIG).map((s) => <option key={s}>{s}</option>)}
                </select>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {factors.map((factor) => {
            const scores = comparing.map((r) => r.breakdown?.[factor]?.score ?? 0);
            const maxScore = Math.max(...scores);
            return (
              <tr key={factor} className="border-t border-gray-100">
                <td className="py-2 pr-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                  {FACTOR_LABELS[factor] || factor}
                </td>
                {comparing.map((r) => {
                  const d = r.breakdown?.[factor];
                  const isTop = d?.score === maxScore && maxScore > 0;
                  return (
                    <td key={r.candidate_id} className="px-2 py-2 text-center">
                      <div className={`text-sm font-bold mb-1 ${isTop ? "text-green-600" : "text-gray-600"}`}>
                        {d?.score?.toFixed(0) ?? "—"} {isTop && "★"}
                      </div>
                      <div className="w-20 mx-auto"><ScoreBar score={d?.score ?? 0} size="sm" /></div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Warnings row */}
          <tr className="border-t border-gray-100">
            <td className="py-2 pr-4 text-xs text-gray-500 font-medium">⚠️ Flags</td>
            {comparing.map((r) => (
              <td key={r.candidate_id} className="px-2 py-2 text-center text-xs">
                {r.warnings?.length > 0 ? (
                  <span className="badge-warning">{r.warnings.length} flag{r.warnings.length > 1 ? "s" : ""}</span>
                ) : (
                  <span className="text-green-500">Clean</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        {results.filter((r) => !compareIds.includes(r.candidate_id)).slice(0, 4).map((r) => (
          <button key={r.candidate_id} onClick={() => onToggle(r.candidate_id)}
            className="text-xs px-3 py-1 border border-dashed border-gray-300 rounded-full text-gray-500 hover:border-purple-400 hover:text-purple-600">
            + {r.parsed_data?.name || r.filename}
          </button>
        ))}
      </div>
    </div>
  );
}
