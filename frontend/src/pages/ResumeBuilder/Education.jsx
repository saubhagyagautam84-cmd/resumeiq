import { IconSchool, IconPlus, IconX, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

function emptyEntry() {
  return { degree: "", field: "", institution: "", year_start: "", year_end: "", gpa: "" };
}

export default function Education({ entries, onChange }) {
  function update(i, field, val) {
    onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }
  function add()     { onChange([...entries, emptyEntry()]); }
  function remove(i) { onChange(entries.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    const next = [...entries];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconSchool size={18} color="#0C447C" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Education</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>List your degrees, most recent first.</div>
        </div>
      </div>

      {entries.map((entry, i) => (
        <div key={i} style={{ border: "1.5px solid #E8E7E2", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#FAFAF9" }}>
            <div style={{ width: 4, background: "#0C447C", flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "14px 16px 14px 14px" }}>
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#26215C" }}>
                  {entry.degree || entry.institution ? `${entry.degree || "Degree"} — ${entry.institution || "Institution"}` : `Education ${i + 1}`}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => move(i, -1)} aria-label="Move up" style={iconBtnStyle}><IconChevronUp size={13} /></button>
                  <button onClick={() => move(i, 1)}  aria-label="Move down" style={iconBtnStyle}><IconChevronDown size={13} /></button>
                  <button onClick={() => remove(i)}   aria-label="Remove" style={{ ...iconBtnStyle, color: "#D85A30" }}><IconX size={13} /></button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="riq-label" htmlFor={`deg-${i}`}>Degree</label>
                  <input id={`deg-${i}`} className="riq-input" placeholder="e.g. Bachelor of Science" value={entry.degree} onChange={e => update(i, "degree", e.target.value)} />
                </div>
                <div>
                  <label className="riq-label" htmlFor={`field-${i}`}>Field of study</label>
                  <input id={`field-${i}`} className="riq-input" placeholder="Computer Science" value={entry.field} onChange={e => update(i, "field", e.target.value)} />
                </div>
                <div>
                  <label className="riq-label" htmlFor={`inst-${i}`}>Institution</label>
                  <input id={`inst-${i}`} className="riq-input" placeholder="MIT" value={entry.institution} onChange={e => update(i, "institution", e.target.value)} />
                </div>
                <div>
                  <label className="riq-label" htmlFor={`ys-${i}`}>Start year</label>
                  <input id={`ys-${i}`} className="riq-input" type="number" min={1950} max={2030} placeholder="2018" value={entry.year_start} onChange={e => update(i, "year_start", e.target.value)} />
                </div>
                <div>
                  <label className="riq-label" htmlFor={`ye-${i}`}>End year</label>
                  <input id={`ye-${i}`} className="riq-input" type="number" min={1950} max={2030} placeholder="2022" value={entry.year_end} onChange={e => update(i, "year_end", e.target.value)} />
                </div>
                <div>
                  <label className="riq-label" htmlFor={`gpa-${i}`}>GPA <span style={{ color: "#9B9A97", fontWeight: 400 }}>(optional)</span></label>
                  <input id={`gpa-${i}`} className="riq-input" placeholder="3.8 / 4.0" value={entry.gpa} onChange={e => update(i, "gpa", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={add}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "#E6F1FB", border: "1.5px dashed #A8C8E8", padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#0C447C", cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}
      >
        <IconPlus size={15} /> Add education
      </button>
    </div>
  );
}

const iconBtnStyle = {
  background: "none", border: "1px solid #E8E7E2",
  borderRadius: 6, padding: "3px 6px", cursor: "pointer",
  color: "#9B9A97", display: "flex", alignItems: "center",
};
