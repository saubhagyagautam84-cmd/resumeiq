/**
 * Resume completeness widget — shows section-by-section status
 * and a progress bar. Used inline in the builder header.
 */
import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconCheck, IconCircle } from "@tabler/icons-react";

function sectionsDone(data) {
  return [
    { label: "Contact",        done: !!(data.name && data.email) },
    { label: "Education",      done: (data.education?.length ?? 0) > 0 },
    { label: "Experience",     done: (data.experience?.length ?? 0) > 0 },
    { label: "Projects",       done: (data.projects?.length ?? 0) > 0 },
    { label: "Skills",         done: (data.skills?.length ?? 0) >= 3 },
    { label: "Certifications", done: (data.certifications?.length ?? 0) > 0 },
    { label: "Summary",        done: (data.summary?.length ?? 0) > 50 },
  ];
}

export default function HealthCheck({ data }) {
  const [open, setOpen] = useState(false);
  const sections = sectionsDone(data);
  const done     = sections.filter(s => s.done).length;
  const total    = sections.length;
  const pct      = Math.round((done / total) * 100);

  const color = pct === 100 ? "#1D9E75" : pct >= 57 ? "#BA7517" : "#D85A30";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "#F8F8F6", border: "1.5px solid #E8E7E2",
          borderRadius: 8, padding: "6px 12px",
          cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
        title="Resume completeness"
      >
        {/* Mini progress bar */}
        <div style={{ width: 52, height: 5, background: "#E8E7E2", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{done}/{total}</span>
        <span style={{ fontSize: 11, color: "#9B9A97" }}>complete</span>
        {open ? <IconChevronUp size={12} color="#9B9A97" /> : <IconChevronDown size={12} color="#9B9A97" />}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            background: "#fff", border: "1.5px solid #E8E7E2",
            borderRadius: 10, padding: "12px 14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            zIndex: 50, minWidth: 200,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#26215C", marginBottom: 10 }}>Resume health</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {sections.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.done
                    ? <IconCheck size={13} color="#1D9E75" />
                    : <IconCircle size={13} color="#C8C7C3" />
                  }
                  <span style={{ fontSize: 12, color: s.done ? "#26215C" : "#9B9A97" }}>{s.label}</span>
                  {!s.done && <span style={{ fontSize: 10, color: "#C8C7C3", marginLeft: "auto" }}>empty</span>}
                </div>
              ))}
            </div>

            {/* ATS tip */}
            {done < total && (
              <div style={{ marginTop: 10, padding: "8px 10px", background: "#FAEEDA", borderRadius: 7, fontSize: 11, color: "#633806" }}>
                Fill all sections for the best ATS score. Missing: {sections.filter(s => !s.done).map(s => s.label).join(", ")}.
              </div>
            )}
            {done === total && (
              <div style={{ marginTop: 10, padding: "8px 10px", background: "#E1F5EE", borderRadius: 7, fontSize: 11, color: "#085041" }}>
                ✓ All sections complete — great ATS readiness!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
