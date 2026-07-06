import { IconX } from "@tabler/icons-react";
import Avatar from "../../components/Avatar";
import ScorePill from "../../components/ScorePill";
import Tag from "../../components/Tag";

const CRITERIA = [
  {
    label: "Match score",
    render: c => <ScorePill score={c.score} />,
  },
  {
    label: "Experience",
    render: c => (
      <span style={{ fontSize: 14, fontWeight: 600, color: "#26215C" }}>
        {c.experience_years ?? "?"} yr{c.experience_years !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    label: "Key skills",
    render: c => (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {(c.skills ?? []).slice(0, 3).map((s, i) => (
          <Tag key={s} label={s} variant={["teal", "blue", "purple"][i % 3]} />
        ))}
        {(c.skills ?? []).length > 3 && (
          <span style={{ fontSize: 11, color: "#9B9A97", alignSelf: "center" }}>+{c.skills.length - 3} more</span>
        )}
      </div>
    ),
  },
  {
    label: "Education",
    render: c => (
      <span style={{ fontSize: 13, color: "#5F5E5A" }}>
        {c.education ?? (c.breakdown?.education != null ? `Score: ${Math.round(c.breakdown.education)}%` : "—")}
      </span>
    ),
  },
  {
    label: "Stage",
    render: c => {
      const s = c.status ?? "New";
      const colors = {
        New: { bg: "#EEEDFE", text: "#26215C" },
        Screening: { bg: "#E6F1FB", text: "#0C447C" },
        Interview: { bg: "#FAEEDA", text: "#633806" },
        Offer: { bg: "#E1F5EE", text: "#085041" },
        Hired: { bg: "#EAF3DE", text: "#27500A" },
        Rejected: { bg: "#FCEBEB", text: "#791F1F" },
        Reviewed: { bg: "#EEEDFE", text: "#26215C" },
        Shortlisted: { bg: "#E1F5EE", text: "#085041" },
      };
      const c2 = colors[s] ?? colors.New;
      return (
        <span style={{ background: c2.bg, color: c2.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
          {s}
        </span>
      );
    },
  },
];

export default function ComparePanel({ candidates, onClose }) {
  return (
    <>
      <div
        role="button"
        aria-label="Close comparison"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Candidate comparison"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(860px, 96vw)", maxHeight: "86vh",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          zIndex: 201, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8E7E2" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#26215C" }}>
            Comparing {candidates.length} candidates
          </span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 4 }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Table — scrollable */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            {/* Column headers: candidate names */}
            <thead>
              <tr style={{ background: "#FAFAF9" }}>
                <th style={{ width: 130, padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#9B9A97", fontWeight: 500, borderBottom: "1px solid #E8E7E2" }}>
                  Criteria
                </th>
                {candidates.map(c => (
                  <th key={c.id} style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid #E8E7E2", minWidth: 140 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <Avatar name={c.name} size={32} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#26215C" }}>{c.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {CRITERIA.map((row, ri) => (
                <tr key={row.label} style={{ background: ri % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                  <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 600, color: "#5F5E5A", borderBottom: "1px solid #F0F0ED" }}>
                    {row.label}
                  </td>
                  {candidates.map(c => (
                    <td key={c.id} style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #F0F0ED" }}>
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #E8E7E2", display: "flex", justifyContent: "flex-end" }}>
          <button className="riq-btn riq-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
