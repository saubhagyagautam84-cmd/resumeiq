/**
 * Paper-like live resume preview.
 * Three templates: classic · modern · minimal
 */

const MONTH_FMT = v => v ?? "";

/* ── Shared section heading ── */
function SectionHeading({ label, color = "#26215C", borderColor = "#E8E7E2" }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
      textTransform: "uppercase", color,
      borderBottom: `1.5px solid ${borderColor}`,
      paddingBottom: 3, marginBottom: 8, marginTop: 18,
    }}>
      {label}
    </div>
  );
}

/* ══════════════════════════════════════════
   CLASSIC — clean two-column header, black/gray
══════════════════════════════════════════ */
function Classic({ data }) {
  const hasContact = data.name || data.email || data.phone || data.location;
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 11.5, color: "#111", lineHeight: 1.55, padding: "32px 36px" }}>
      {/* Header */}
      {hasContact && (
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, marginBottom: 4 }}>{data.name || "Your Name"}</div>
          <div style={{ fontSize: 11, color: "#444", display: "flex", flexWrap: "wrap", gap: "0 10px", justifyContent: "center" }}>
            {[data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean).map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <>
          <SectionHeading label="Summary" />
          <p style={{ margin: 0, fontSize: 11.5 }}>{data.summary}</p>
        </>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <>
          <SectionHeading label="Experience" />
          {data.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>{e.title || "Title"}</span>
                <span style={{ fontSize: 10.5, color: "#555" }}>{[e.start_date, e.is_current ? "Present" : e.end_date].filter(Boolean).join(" – ")}</span>
              </div>
              <div style={{ fontSize: 10.5, fontStyle: "italic", color: "#444", marginBottom: 3 }}>{e.company}</div>
              {e.description && (
                <div style={{ fontSize: 11 }}>
                  {e.description.split("\n").filter(Boolean).map((line, j) => (
                    <div key={j} style={{ marginBottom: 1 }}>{line.startsWith("•") ? line : `• ${line}`}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <>
          <SectionHeading label="Education" />
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <span style={{ fontWeight: 700 }}>{[e.degree, e.field].filter(Boolean).join(", ") || "Degree"}</span>
                {e.institution && <span style={{ fontStyle: "italic", color: "#444" }}> — {e.institution}</span>}
                {e.gpa && <span style={{ fontSize: 10.5, color: "#555" }}> · GPA {e.gpa}</span>}
              </div>
              <span style={{ fontSize: 10.5, color: "#555", flexShrink: 0 }}>
                {[e.year_start, e.year_end].filter(Boolean).join(" – ")}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <>
          <SectionHeading label="Skills" />
          <p style={{ margin: 0 }}>{data.skills.join(" · ")}</p>
        </>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <>
          <SectionHeading label="Projects" />
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>{p.title || "Project"}</span>
              {(p.skills ?? []).length > 0 && <span style={{ fontSize: 10.5, color: "#555" }}> · {p.skills.join(", ")}</span>}
              {p.description && <div style={{ fontSize: 11, marginTop: 1 }}>{p.description.split("\n")[0]}</div>}
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <>
          <SectionHeading label="Certifications" />
          <p style={{ margin: 0 }}>{data.certifications.join(" · ")}</p>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODERN — purple accent, sans-serif, bold header
══════════════════════════════════════════ */
function Modern({ data }) {
  return (
    <div style={{ fontFamily: "-apple-system, 'Inter', sans-serif", fontSize: 11.5, color: "#1A1A1A", lineHeight: 1.55 }}>
      {/* Purple header band */}
      <div style={{ background: "#26215C", color: "#fff", padding: "24px 30px 20px" }}>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>{data.name || "Your Name"}</div>
        <div style={{ fontSize: 10.5, color: "#C4C0F0", marginTop: 5, display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
        {(data.linkedin || data.github) && (
          <div style={{ fontSize: 10.5, color: "#A8A4E0", marginTop: 3, display: "flex", gap: 12 }}>
            {[data.linkedin, data.github].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 30px 28px" }}>
        {data.summary && (
          <>
            <SectionHeading label="Summary" color="#26215C" borderColor="#C4C0F0" />
            <p style={{ margin: 0, fontSize: 11.5 }}>{data.summary}</p>
          </>
        )}

        {data.experience?.length > 0 && (
          <>
            <SectionHeading label="Experience" color="#26215C" borderColor="#C4C0F0" />
            {data.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, color: "#26215C" }}>{e.title || "Title"}</span>
                  <span style={{ fontSize: 10, color: "#7F77DD", fontWeight: 600 }}>{[e.start_date, e.is_current ? "Present" : e.end_date].filter(Boolean).join(" – ")}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "#534AB7", marginBottom: 3 }}>{e.company}</div>
                {e.description && e.description.split("\n").filter(Boolean).map((line, j) => (
                  <div key={j} style={{ fontSize: 11, marginBottom: 1 }}>{line.startsWith("•") ? line : `• ${line}`}</div>
                ))}
              </div>
            ))}
          </>
        )}

        {data.education?.length > 0 && (
          <>
            <SectionHeading label="Education" color="#26215C" borderColor="#C4C0F0" />
            {data.education.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{[e.degree, e.field].filter(Boolean).join(", ") || "Degree"}</span>
                  {e.institution && <span style={{ color: "#534AB7" }}> — {e.institution}</span>}
                </div>
                <span style={{ fontSize: 10, color: "#7F77DD", fontWeight: 600 }}>{[e.year_start, e.year_end].filter(Boolean).join("–")}</span>
              </div>
            ))}
          </>
        )}

        {data.skills?.length > 0 && (
          <>
            <SectionHeading label="Skills" color="#26215C" borderColor="#C4C0F0" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ background: "#EEEDFE", color: "#26215C", fontSize: 10.5, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {data.projects?.length > 0 && (
          <>
            <SectionHeading label="Projects" color="#26215C" borderColor="#C4C0F0" />
            {data.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 700, color: "#26215C" }}>{p.title || "Project"}</span>
                {(p.skills ?? []).length > 0 && <span style={{ fontSize: 10, color: "#7F77DD" }}> · {p.skills.join(", ")}</span>}
                {p.description && <div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>{p.description.split("\n")[0]}</div>}
              </div>
            ))}
          </>
        )}

        {data.certifications?.length > 0 && (
          <>
            <SectionHeading label="Certifications" color="#26215C" borderColor="#C4C0F0" />
            {data.certifications.map((c, i) => <div key={i} style={{ fontSize: 11.5, marginBottom: 2 }}>· {c}</div>)}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MINIMAL — pure text, maximum whitespace
══════════════════════════════════════════ */
function Minimal({ data }) {
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11.5, color: "#222", lineHeight: 1.6, padding: "36px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{data.name || "Your Name"}</div>
        <div style={{ fontSize: 10.5, color: "#666", display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
          {[data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>

      {data.summary && (
        <>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 4 }}>Summary</div>
          <p style={{ margin: "0 0 14px", fontSize: 11.5 }}>{data.summary}</p>
        </>
      )}

      {data.experience?.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Experience</div>
          {data.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{[e.title, e.company].filter(Boolean).join(" — ")}</span>
                <span style={{ fontSize: 10, color: "#888" }}>{[e.start_date, e.is_current ? "Present" : e.end_date].filter(Boolean).join(" – ")}</span>
              </div>
              {e.description && e.description.split("\n").filter(Boolean).map((line, j) => (
                <div key={j} style={{ fontSize: 11, color: "#333", marginBottom: 1 }}>{line.startsWith("•") ? line : `• ${line}`}</div>
              ))}
            </div>
          ))}
        </>
      )}

      {data.education?.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Education</div>
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{[e.degree, e.field, e.institution].filter(Boolean).join(", ")}</span>
              <span style={{ fontSize: 10, color: "#888" }}>{[e.year_start, e.year_end].filter(Boolean).join("–")}</span>
            </div>
          ))}
        </>
      )}

      {data.skills?.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 4 }}>Skills</div>
          <p style={{ margin: "0 0 12px" }}>{data.skills.join(" · ")}</p>
        </>
      )}

      {data.certifications?.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 4 }}>Certifications</div>
          <p style={{ margin: 0 }}>{data.certifications.join(" · ")}</p>
        </>
      )}
    </div>
  );
}

const TEMPLATES = { classic: Classic, modern: Modern, minimal: Minimal };

export default function ResumePreview({ data, template = "classic" }) {
  const Template = TEMPLATES[template] ?? Classic;
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{
        width: "100%", maxWidth: 580, margin: "0 auto",
        background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
        minHeight: 820, borderRadius: 2,
      }}>
        <Template data={data} />
      </div>
    </div>
  );
}
