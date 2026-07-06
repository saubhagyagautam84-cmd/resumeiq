import { useState } from "react";
import Avatar from "../../components/Avatar";
import ScorePill from "../../components/ScorePill";
import Tag from "../../components/Tag";

export const PIPELINE_STAGES = ["New", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const STAGE_COLORS = {
  New:       { bg: "#EEEDFE", text: "#26215C", dot: "#7F77DD" },
  Screening: { bg: "#E6F1FB", text: "#0C447C", dot: "#0C447C" },
  Interview: { bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
  Offer:     { bg: "#E1F5EE", text: "#085041", dot: "#1D9E75" },
  Hired:     { bg: "#EAF3DE", text: "#27500A", dot: "#27500A" },
  Rejected:  { bg: "#FCEBEB", text: "#791F1F", dot: "#D85A30" },
};

export default function PipelineBoard({ candidates, onUpdate }) {
  const [dragId,      setDragId]      = useState(null);
  const [overStage,   setOverStage]   = useState(null);

  function handleDrop(stage) {
    if (!dragId) return;
    onUpdate(candidates.map(c => c.id === dragId ? { ...c, status: stage } : c));
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, alignItems: "flex-start" }}>
      {PIPELINE_STAGES.map(stage => {
        const cards = candidates.filter(c => (c.status ?? "New") === stage);
        const sc = STAGE_COLORS[stage];
        const isOver = overStage === stage;

        return (
          <div
            key={stage}
            onDragOver={e => { e.preventDefault(); setOverStage(stage); }}
            onDragLeave={() => setOverStage(s => s === stage ? null : s)}
            onDrop={() => handleDrop(stage)}
            style={{
              minWidth: 180, flex: "0 0 180px",
              background: isOver ? sc.bg : "#F8F8F6",
              borderRadius: 10, padding: "10px 8px",
              border: `1.5px dashed ${isOver ? sc.dot : "#E8E7E2"}`,
              transition: "background 0.15s, border-color 0.15s",
              minHeight: 120,
            }}
          >
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0 4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: sc.text }}>{stage}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9B9A97", background: "#fff", padding: "1px 6px", borderRadius: 10 }}>
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {cards.map(c => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => { setDragId(null); setOverStage(null); }}
                  style={{
                    background: "#fff", borderRadius: 8,
                    padding: "10px 10px 8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    cursor: "grab",
                    opacity: dragId === c.id ? 0.45 : 1,
                    transition: "opacity 0.15s, box-shadow 0.15s",
                    border: "1px solid #E8E7E2",
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)"}
                  onMouseOut={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <Avatar name={c.name} size={26} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#26215C", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <ScorePill score={c.score} />
                    {(c.skills ?? []).slice(0, 1).map((s, i) => (
                      <Tag key={s} label={s} variant={["teal", "blue", "purple"][i % 3]} />
                    ))}
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div style={{ fontSize: 11, color: "#C8C7C3", textAlign: "center", padding: "12px 0" }}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
