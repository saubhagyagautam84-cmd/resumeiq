/**
 * Live resume preview — updates in real time as the user fills the form.
 * Renders a scaled paper-like document using the selected template style.
 * All templates stay ATS-safe (single column, no graphics).
 */

const STYLES = {
  classic: {
    wrapper: "font-serif text-gray-900",
    name: "text-2xl font-bold text-center tracking-wide",
    contact: "text-center text-xs text-gray-500 mt-1",
    divider: "border-t-2 border-gray-800 my-2",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-b border-gray-700 pb-0.5 mb-1 mt-3",
    jobTitle: "font-semibold text-sm",
    company: "text-xs text-gray-600",
    bullet: "text-xs text-gray-700 ml-3",
    body: "text-xs text-gray-700",
  },
  modern: {
    wrapper: "font-sans text-gray-900",
    name: "text-2xl font-bold text-blue-700 border-l-4 border-blue-500 pl-3",
    contact: "text-xs text-gray-500 pl-4 mt-0.5",
    divider: "border-t border-blue-100 my-2",
    sectionTitle: "text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 mt-3",
    jobTitle: "font-semibold text-sm",
    company: "text-xs text-blue-500",
    bullet: "text-xs text-gray-700 ml-3",
    body: "text-xs text-gray-700",
  },
  minimal: {
    wrapper: "font-sans text-gray-800",
    name: "text-xl font-light uppercase tracking-[0.25em]",
    contact: "text-xs text-gray-400 tracking-widest mt-0.5",
    divider: "border-t border-gray-200 my-2",
    sectionTitle: "text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 mt-3",
    jobTitle: "font-medium text-sm",
    company: "text-xs text-gray-400",
    bullet: "text-xs text-gray-600 ml-3",
    body: "text-xs text-gray-600",
  },
};

export default function ResumePreview({ resumeData, template = "classic" }) {
  const s = STYLES[template] || STYLES.classic;

  const {
    name, email, phone, location, linkedin, github, website,
    summary, education = [], experience = [], projects = [],
    skills = [], certifications = [],
  } = resumeData;

  const contactParts = [email, phone, location, linkedin, github, website].filter(Boolean);
  const hasContent = name || contactParts.length || summary || education.length ||
    experience.length || projects.length || skills.length || certifications.length;

  return (
    <div className="bg-gray-100 rounded-xl p-4 h-full overflow-auto">
      <div className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
        Live Preview
      </div>

      {/* Paper */}
      <div className={`bg-white shadow-lg mx-auto rounded-sm p-6 min-h-[600px] ${s.wrapper}`}
           style={{ width: "100%", maxWidth: 480 }}>
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-300">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">Your resume preview will appear here</p>
          </div>
        ) : (
          <>
            {/* Header */}
            {name && <div className={s.name}>{name}</div>}
            {contactParts.length > 0 && (
              <div className={s.contact}>{contactParts.join(" · ")}</div>
            )}

            {/* Summary */}
            {summary && (
              <>
                <div className={s.divider} />
                <div className={s.sectionTitle}>Summary</div>
                <p className={s.body}>{summary}</p>
              </>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <>
                <div className={s.sectionTitle}>Experience</div>
                {experience.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className={s.jobTitle}>{exp.title || "—"}</span>
                      <span className={s.company}>
                        {[exp.start_date, exp.is_current ? "Present" : exp.end_date].filter(Boolean).join(" – ")}
                      </span>
                    </div>
                    {exp.company && <div className={s.company}>{exp.company}</div>}
                    {exp.description && exp.description.split("\n").map((line, j) => {
                      const clean = line.trim().replace(/^[•·\-–]\s*/, "");
                      return clean ? <div key={j} className={s.bullet}>• {clean}</div> : null;
                    })}
                  </div>
                ))}
              </>
            )}

            {/* Education */}
            {education.length > 0 && (
              <>
                <div className={s.sectionTitle}>Education</div>
                {education.map((edu, i) => (
                  <div key={i} className="mb-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className={s.jobTitle}>
                        {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                      </span>
                      <span className={s.company}>{edu.year_end || ""}</span>
                    </div>
                    {edu.institution && <div className={s.company}>{edu.institution}</div>}
                    {edu.gpa && <div className={s.company}>GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <>
                <div className={s.sectionTitle}>Projects</div>
                {projects.map((proj, i) => (
                  <div key={i} className="mb-1.5">
                    <div className={s.jobTitle}>{proj.title}</div>
                    {proj.description && <div className={s.bullet}>• {proj.description}</div>}
                    {proj.skills?.length > 0 && (
                      <div className={s.company}>Tech: {proj.skills.join(", ")}</div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <>
                <div className={s.sectionTitle}>Skills</div>
                <div className={s.body}>{skills.join(" · ")}</div>
              </>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <>
                <div className={s.sectionTitle}>Certifications</div>
                {certifications.map((c, i) => (
                  <div key={i} className={s.bullet}>• {c}</div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
