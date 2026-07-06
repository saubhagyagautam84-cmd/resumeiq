import { useState } from "react";
import { IconBolt, IconX } from "@tabler/icons-react";

const SUGGESTED = ["Python", "SQL", "React", "AWS", "Machine learning", "Communication", "Leadership", "Docker"];

export default function Skills({ skills, onChange }) {
  const [input, setInput] = useState("");

  function add(val) {
    const v = (val ?? input).trim();
    if (!v || skills.includes(v)) { setInput(""); return; }
    onChange([...skills, v]);
    setInput("");
  }

  function remove(s) { onChange(skills.filter(x => x !== s)); }

  const suggestions = SUGGESTED.filter(s => !skills.includes(s));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#E1F5EE",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconBolt size={18} color="#1D9E75" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Skills</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Be specific — "React" is better than "Frontend".</div>
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="riq-input"
          style={{ flex: 1 }}
          placeholder="Type a skill and press Enter…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button
          className="riq-btn riq-btn-primary"
          style={{ padding: "9px 18px" }}
          onClick={() => add()}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>

      {/* Current tags */}
      {skills.length > 0 && (
        <div>
          <p className="riq-label" style={{ marginBottom: 8 }}>Your skills</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {skills.map(s => (
              <span key={s} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 20,
                background: "#EEEDFE", color: "#26215C",
                fontSize: 13, fontWeight: 500,
              }}>
                {s}
                <button
                  onClick={() => remove(s)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#7F77DD", display: "flex" }}
                >
                  <IconX size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick-add suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="riq-label" style={{ marginBottom: 8 }}>Quick add</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {suggestions.slice(0, 12).map(s => (
              <button
                key={s}
                onClick={() => add(s)}
                style={{
                  padding: "5px 12px", borderRadius: 20,
                  border: "1.5px dashed #C8C7C3",
                  background: "transparent", color: "#5F5E5A",
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#F2F2EF")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent")}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
