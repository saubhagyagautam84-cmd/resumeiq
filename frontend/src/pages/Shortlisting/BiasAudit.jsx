import { IconAlertTriangle, IconDownload, IconInfoCircle } from "@tabler/icons-react";

const DEMO_DISTRIBUTION = [
  { label: "0 – 40%  (weak)",  count: 3,  color: "#D85A30" },
  { label: "41 – 60%  (fair)", count: 5,  color: "#BA7517" },
  { label: "61 – 80%  (good)", count: 8,  color: "#1D9E75" },
  { label: "81 – 100% (strong)", count: 4, color: "#27500A" },
];

const DEMO_FLAGS = [
  {
    id: 1,
    title: "Employment gap penalty may be too aggressive",
    body: "3 candidates were scored lower primarily because of an employment gap > 12 months. Consider reviewing these manually — gaps are often for legitimate reasons (caregiving, study, health).",
  },
  {
    id: 2,
    title: "Low data — certification weight reliability",
    body: "Only 2 of 20 candidates listed certifications. Scoring weight on certifications (10%) has low statistical reliability with this sample. Consider lowering it or disabling for this role.",
  },
  {
    id: 3,
    title: "Education tier may disadvantage non-traditional paths",
    body: "4 candidates from bootcamp or self-taught backgrounds scored ≤ 45% on the education dimension. If the role doesn't strictly require a degree, consider setting education weight to 0.",
  },
];

const EXP_DISTRIBUTION = [
  { label: "0 – 2 yrs",  count: 4 },
  { label: "3 – 5 yrs",  count: 9 },
  { label: "6 – 10 yrs", count: 5 },
  { label: "10+ yrs",    count: 2 },
];

export default function BiasAudit() {
  const totalScore = DEMO_DISTRIBUTION.reduce((s, b) => s + b.count, 0);
  const totalExp   = EXP_DISTRIBUTION.reduce((s, b) => s + b.count, 0);

  function exportCsv() {
    const rows = [
      ["Score band", "Count"],
      ...DEMO_DISTRIBUTION.map(b => [b.label, b.count]),
      [],
      ["Flag", "Description"],
      ...DEMO_FLAGS.map(f => [f.title, f.body]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: "bias_audit.csv",
    });
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconInfoCircle size={18} color="#BA7517" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Bias audit</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Score distribution analysis and scoring fairness flags for this job posting.</div>
        </div>
      </div>

      {/* Score distribution */}
      <div className="riq-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 4 }}>Score distribution</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 14 }}>
          Overall score spread across {totalScore} candidates. A healthy distribution should be roughly bell-shaped.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {DEMO_DISTRIBUTION.map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#5F5E5A", minWidth: 140 }}>{b.label}</span>
              <div style={{ flex: 1, height: 18, background: "#F2F2EF", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.round(b.count / totalScore * 100)}%`,
                  height: "100%", background: b.color, borderRadius: 4,
                  transition: "width 0.5s",
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.color, minWidth: 28 }}>{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience distribution */}
      <div className="riq-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 4 }}>Experience band distribution</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 14 }}>
          How candidates spread across experience bands. Compare against your minimum requirement.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {EXP_DISTRIBUTION.map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#5F5E5A", minWidth: 80 }}>{b.label}</span>
              <div style={{ flex: 1, height: 18, background: "#F2F2EF", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.round(b.count / totalExp * 100)}%`,
                  height: "100%", background: "#7F77DD", borderRadius: 4,
                  transition: "width 0.5s",
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#26215C", minWidth: 24 }}>{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#26215C", marginBottom: 10 }}>Scoring flags</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DEMO_FLAGS.map(flag => (
            <div key={flag.id} style={{
              borderLeft: "3px solid #BA7517",
              background: "#FFFDF5", borderRadius: "0 10px 10px 0",
              padding: "12px 16px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <IconAlertTriangle size={16} color="#BA7517" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#633806", marginBottom: 4 }}>{flag.title}</div>
                <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.6 }}>{flag.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div>
        <button
          onClick={exportCsv}
          className="riq-btn riq-btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <IconDownload size={15} /> Export audit report (CSV)
        </button>
      </div>
    </div>
  );
}
