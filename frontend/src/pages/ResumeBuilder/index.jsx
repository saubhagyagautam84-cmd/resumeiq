import { useState, useEffect, useRef } from "react";
import {
  IconPencil, IconLayoutSidebarRight, IconLayoutColumns,
  IconTarget, IconX, IconPalette,
} from "@tabler/icons-react";
import Chip           from "../../components/Chip";
import Contact        from "./Contact";
import Education      from "./Education";
import Experience     from "./Experience";
import Projects       from "./Projects";
import Skills         from "./Skills";
import Certifications from "./Certifications";
import Summary        from "./Summary";
import ResumePreview  from "./ResumePreview";
import HealthCheck    from "./HealthCheck";

const SUB_TABS = [
  { id: "contact",        label: "Contact" },
  { id: "education",      label: "Education" },
  { id: "experience",     label: "Experience" },
  { id: "projects",       label: "Projects" },
  { id: "skills",         label: "Skills" },
  { id: "certifications", label: "Certs" },
  { id: "summary",        label: "Summary" },
];

const TEMPLATES = [
  { id: "classic", label: "Classic",  desc: "Serif, traditional" },
  { id: "modern",  label: "Modern",   desc: "Purple header, sans-serif" },
  { id: "minimal", label: "Minimal",  desc: "Ultra-clean, whitespace" },
];

const EMPTY = {
  name: "", email: "", phone: "", location: "", linkedin: "", github: "",
  education: [], experience: [], projects: [], skills: [], certifications: [], summary: "",
};

export default function ResumeBuilder({ isMobile = false }) {
  const [sub,       setSub]       = useState("contact");
  const [data,      setData]      = useState({ ...EMPTY });
  const [resumeId,  setResumeId]  = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [viewMode,  setViewMode]  = useState("form");
  const [template,  setTemplate]  = useState("classic");
  const [showTpl,   setShowTpl]   = useState(false);
  const [showJd,    setShowJd]    = useState(false);
  const [jdText,    setJdText]    = useState("");
  const [jdReqs,    setJdReqs]    = useState(null);
  const [jdScore,   setJdScore]   = useState(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const saveTimer  = useRef(null);
  const scoreTimer = useRef(null);

  // Force form-only on mobile
  const effectiveViewMode = isMobile ? "form" : viewMode;
  const isSplit = effectiveViewMode === "split";

  // Nav height: mobile top bar = 48px, desktop = 54px
  const navH = isMobile ? 48 : 54;

  useEffect(() => {
    import("../../services/api").then(({ builder }) =>
      builder.create({}).then(r => setResumeId(r.id)).catch(() => {})
    );
  }, []);

  useEffect(() => {
    if (!resumeId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const { builder } = await import("../../services/api");
        await builder.update(resumeId, { resume_data: data });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch { setSaveState("idle"); }
    }, 1400);
    return () => clearTimeout(saveTimer.current);
  }, [data, resumeId]);

  useEffect(() => {
    if (!jdReqs) return;
    clearTimeout(scoreTimer.current);
    scoreTimer.current = setTimeout(async () => {
      try {
        const { scoring } = await import("../../services/api");
        const result = await scoring.scoreLive({ resume_data: data, jd_requirements: jdReqs });
        setJdScore(result.total_score);
      } catch { /* silent */ }
    }, 1000);
    return () => clearTimeout(scoreTimer.current);
  }, [data, jdReqs]);

  function update(key, value) { setData(d => ({ ...d, [key]: value })); }

  async function setTargetJd() {
    if (!jdText.trim() || !resumeId) return;
    setJdLoading(true);
    try {
      const { builder } = await import("../../services/api");
      const result = await builder.setJd(resumeId, jdText);
      setJdReqs(result.requirements);
      setShowJd(false);
      setJdScore(null);
    } catch { /* silent */ }
    finally { setJdLoading(false); }
  }

  function clearJd() { setJdReqs(null); setJdScore(null); setJdText(""); }

  const subIdx = SUB_TABS.findIndex(t => t.id === sub);

  const scoreColor = jdScore == null ? "#9B9A97"
    : jdScore >= 75 ? "#1D9E75"
    : jdScore >= 50 ? "#BA7517"
    : "#D85A30";

  return (
    <div style={{ minHeight: `calc(100vh - ${navH}px)`, display: "flex", flexDirection: "column" }}>

      {/* ════════════════════════════════════════
          BUILDER TOP BAR
      ════════════════════════════════════════ */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E8E7E2",
        padding: isMobile ? "8px 14px" : "10px 20px",
        display: "flex", alignItems: "center", gap: isMobile ? 8 : 10,
        flexWrap: "wrap",
        position: "sticky", top: navH, zIndex: 40,
      }}>
        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: isMobile ? 1 : "none", marginRight: isMobile ? 0 : 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconPencil size={14} color="#1D9E75" />
          </div>
          <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#26215C", whiteSpace: "nowrap" }}>
            Resume builder
          </span>
        </div>

        {/* Save indicator */}
        <span style={{
          fontSize: 11, order: isMobile ? 2 : "unset",
          color: saveState === "saving" ? "#9B9A97" : saveState === "saved" ? "#1D9E75" : "transparent",
          transition: "color 0.2s", whiteSpace: "nowrap",
          marginLeft: isMobile ? "auto" : 0,
        }}>
          {saveState === "saving" ? "Saving…" : "✓ Saved"}
        </span>

        {/* ── Template picker ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowTpl(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "#EEEDFE", border: "none", borderRadius: 7,
              padding: isMobile ? "7px 10px" : "6px 11px",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 500, color: "#26215C",
              minHeight: isMobile ? 36 : "auto",
            }}
          >
            <IconPalette size={13} />
            {!isMobile && (TEMPLATES.find(t => t.id === template)?.label ?? "Template")}
          </button>

          {showTpl && (
            <>
              <div onClick={() => setShowTpl(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                background: "#fff", border: "1.5px solid #E8E7E2", borderRadius: 10,
                padding: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                zIndex: 50, display: "flex", flexDirection: "column", gap: 5, minWidth: 180,
              }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTemplate(t.id); setShowTpl(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start",
                      padding: "8px 11px", borderRadius: 7, border: "none",
                      background: template === t.id ? "#EEEDFE" : "transparent",
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      outline: template === t.id ? "1.5px solid #7F77DD" : "none",
                      minHeight: 44,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#26215C" }}>{t.label}</span>
                    <span style={{ fontSize: 11, color: "#9B9A97" }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── View mode toggle — desktop only ── */}
        {!isMobile && (
          <div style={{ display: "flex", background: "#F2F2EF", borderRadius: 7, padding: 3, gap: 2 }}>
            {[
              { id: "form",  Icon: IconLayoutSidebarRight, label: "Form only" },
              { id: "split", Icon: IconLayoutColumns,       label: "Split view" },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                title={label}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 10px", borderRadius: 5, border: "none",
                  background: viewMode === id ? "#fff" : "transparent",
                  boxShadow: viewMode === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  color: viewMode === id ? "#26215C" : "#9B9A97",
                  fontSize: 12, fontWeight: viewMode === id ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── JD match score ── */}
        {jdReqs ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#F8F8F6", border: "1.5px solid #E8E7E2",
              borderRadius: 8, padding: "5px 10px",
              minHeight: isMobile ? 36 : "auto",
            }}>
              <IconTarget size={13} color={scoreColor} />
              <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>
                {jdScore != null ? `${Math.round(jdScore)}%` : "…"}
              </span>
              {!isMobile && <span style={{ fontSize: 11, color: "#9B9A97" }}>JD match</span>}
              {jdScore != null && !isMobile && (
                <div style={{ width: 40, height: 4, background: "#E8E7E2", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(jdScore)}%`, height: "100%", background: scoreColor, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              )}
            </div>
            <button
              onClick={clearJd}
              aria-label="Clear target JD"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9B9A97" }}
            >
              <IconX size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowJd(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "1.5px dashed #C8C7C3",
              borderRadius: 7, padding: isMobile ? "7px 10px" : "5px 11px",
              cursor: "pointer", fontSize: 12, color: "#9B9A97",
              fontFamily: "inherit",
              minHeight: isMobile ? 36 : "auto",
            }}
          >
            <IconTarget size={13} />
            {isMobile ? "Set JD" : "Set target JD"}
          </button>
        )}

        {/* ── Health check — always show ── */}
        <div style={{ marginLeft: isMobile ? 0 : "auto" }}>
          <HealthCheck data={data} />
        </div>

        {/* Preview button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setShowPreviewModal(true)}
            style={{
              background: "linear-gradient(135deg, #1D9E75, #0F6E56)",
              color: "#fff", border: "none", borderRadius: 7,
              padding: "7px 12px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              minHeight: 36,
            }}
          >
            Preview
          </button>
        )}
      </div>

      {/* ── JD paste panel ── */}
      {showJd && (
        <div style={{
          background: "#F8F8FF", borderBottom: "1px solid #E0DFFB",
          padding: isMobile ? "12px 14px" : "12px 20px",
          display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="riq-label" htmlFor="jd-paste">Paste target job description</label>
            <textarea
              id="jd-paste"
              className="riq-input"
              style={{ minHeight: 56, fontSize: 13 }}
              placeholder="Paste the JD you're applying for — your live match % will update as you fill in sections…"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
            <button className="riq-btn riq-btn-primary" onClick={setTargetJd} disabled={jdLoading || !jdText.trim()}>
              {jdLoading ? "Parsing…" : "Set JD"}
            </button>
            <button className="riq-btn riq-btn-secondary" onClick={() => setShowJd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: isSplit ? "hidden" : "visible", height: isSplit ? `calc(100vh - ${navH + 52}px)` : "auto" }}>

        {/* Form side */}
        <div style={{
          flex: isSplit ? "0 0 50%" : "1 1 auto",
          overflowY: isSplit ? "auto" : "visible",
          padding: isSplit ? "20px" : "0",
          maxWidth: isSplit ? "none" : 900,
          margin: isSplit ? "0" : "0 auto",
          width: "100%",
        }}>
          <div style={{ padding: isSplit ? 0 : isMobile ? "14px 14px 0" : "16px 20px 0" }}>

            {/* Sub-tab chips — hidden scrollbar */}
            <div style={{
              display: "flex", gap: 6, marginBottom: 14,
              overflowX: "auto", paddingBottom: 4,
              scrollbarWidth: "none", msOverflowStyle: "none",
            }}
              ref={el => { if (el) el.style.cssText += "-webkit-overflow-scrolling:touch;"; }}
            >
              {SUB_TABS.map(t => (
                <Chip key={t.id} label={t.label} active={sub === t.id} onClick={() => setSub(t.id)} />
              ))}
            </div>

            {/* Section progress */}
            <div style={{ fontSize: 12, color: "#9B9A97", marginBottom: 12 }}>
              Section {subIdx + 1} of {SUB_TABS.length}
            </div>

            {/* Section card */}
            <div className="riq-card" style={{ padding: isMobile ? 16 : 24, marginBottom: 14 }}>
              {sub === "contact"        && <Contact        data={data}                  onChange={update} />}
              {sub === "education"      && <Education      entries={data.education}      onChange={v => update("education", v)} />}
              {sub === "experience"     && <Experience     entries={data.experience}     onChange={v => update("experience", v)} resumeId={resumeId} />}
              {sub === "projects"       && <Projects       entries={data.projects}       onChange={v => update("projects", v)} />}
              {sub === "skills"         && <Skills         skills={data.skills}          onChange={v => update("skills", v)} />}
              {sub === "certifications" && <Certifications certs={data.certifications}   onChange={v => update("certifications", v)} />}
              {sub === "summary"        && <Summary        summary={data.summary}        onChange={v => update("summary", v)} />}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
              <button
                className="riq-btn riq-btn-secondary"
                onClick={() => setSub(SUB_TABS[subIdx - 1].id)}
                style={{ visibility: subIdx > 0 ? "visible" : "hidden", flex: 1, maxWidth: 160 }}
              >
                ← {subIdx > 0 ? SUB_TABS[subIdx - 1].label : ""}
              </button>
              <button
                className="riq-btn riq-btn-primary"
                onClick={() => setSub(SUB_TABS[subIdx + 1].id)}
                style={{ visibility: subIdx < SUB_TABS.length - 1 ? "visible" : "hidden", flex: 1, maxWidth: 160 }}
              >
                {subIdx < SUB_TABS.length - 1 ? SUB_TABS[subIdx + 1].label : ""} →
              </button>
            </div>

            {/* Export bar */}
            {resumeId && (
              <div className="riq-card" style={{
                padding: isMobile ? "10px 14px" : "11px 18px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                marginBottom: isSplit ? 0 : 24,
              }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>
                  {data.name || "Your resume"} · ATS-safe export
                </span>
                <div style={{ display: "flex", gap: 7 }}>
                  <ExportBtn resumeId={resumeId} format="pdf"  label="PDF" />
                  <ExportBtn resumeId={resumeId} format="docx" label="DOCX" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview side — desktop split only */}
        {isSplit && (
          <div style={{ flex: 1, overflowY: "auto", background: "#EDEDEA", borderLeft: "1px solid #E8E7E2" }}>
            <div style={{ padding: "10px 8px 4px 12px", fontSize: 11, fontWeight: 600, color: "#9B9A97", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Live preview · {TEMPLATES.find(t => t.id === template)?.label}
            </div>
            <ResumePreview data={data} template={template} />
          </div>
        )}
      </div>

      {/* ── Mobile preview modal ── */}
      {showPreviewModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column",
        }}>
          <div style={{
            background: "#EDEDEA",
            flex: 1, overflowY: "auto",
            borderRadius: "16px 16px 0 0",
            marginTop: 48,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px 8px",
              background: "#fff", borderBottom: "1px solid #E8E7E2",
              borderRadius: "16px 16px 0 0",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#26215C" }}>
                Preview · {TEMPLATES.find(t => t.id === template)?.label}
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#71717A" }}
              >
                <IconX size={18} />
              </button>
            </div>
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      )}
    </div>
  );
}

function ExportBtn({ resumeId, format, label }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const { builder } = await import("../../services/api");
      const { blob } = await builder.exportResume(resumeId, format);
      const url = URL.createObjectURL(blob);
      const a   = Object.assign(document.createElement("a"), { href: url, download: `resume.${format}` });
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    } catch (err) { alert(err.message); }
    finally { setBusy(false); }
  }

  return (
    <button onClick={go} disabled={busy} className="riq-btn riq-btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>
      {busy ? "…" : label}
    </button>
  );
}
