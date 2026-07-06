import { useState } from "react";
import { IconCertificate, IconPlus, IconX } from "@tabler/icons-react";

const SUGGESTIONS = [
  "AWS Certified Solutions Architect",
  "Google Cloud Professional",
  "PMP — Project Management",
  "Certified Scrum Master",
  "TensorFlow Developer Certificate",
  "Microsoft Azure Fundamentals",
];

export default function Certifications({ certs, onChange }) {
  const [input, setInput] = useState("");

  function add(val) {
    const v = (val ?? input).trim();
    if (!v || certs.includes(v)) { setInput(""); return; }
    onChange([...certs, v]);
    setInput("");
  }

  function remove(i) { onChange(certs.filter((_, idx) => idx !== i)); }

  const suggestions = SUGGESTIONS.filter(s => !certs.includes(s));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconCertificate size={18} color="#BA7517" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Certifications</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Industry certs can significantly boost your ATS score.</div>
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="riq-input"
          style={{ flex: 1 }}
          placeholder="e.g. AWS Solutions Architect — Associate"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button
          className="riq-btn riq-btn-primary"
          style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 5 }}
          onClick={() => add()}
          disabled={!input.trim()}
        >
          <IconPlus size={14} /> Add
        </button>
      </div>

      {/* Current certs */}
      {certs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {certs.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 8,
              background: "#FFFDF5", border: "1.5px solid #E8D5A0",
            }}>
              <IconCertificate size={15} color="#BA7517" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: "#633806", fontWeight: 500 }}>{c}</span>
              <button
                onClick={() => remove(i)}
                aria-label={`Remove ${c}`}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9B9A97" }}
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick-add suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="riq-label" style={{ marginBottom: 8 }}>Common certifications</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {suggestions.slice(0, 6).map(s => (
              <button
                key={s}
                onClick={() => add(s)}
                style={{
                  padding: "5px 12px", borderRadius: 20,
                  border: "1.5px dashed #C8A840",
                  background: "transparent", color: "#633806",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#FAEEDA")}
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
