import { useState, useEffect, useRef } from "react";
import TemplateGallery from "./TemplateGallery";
import ResumePreview from "./ResumePreview";
import ExportPanel from "./ExportPanel";
import ErrorAlert from "../../components/ErrorAlert";
import {
  ContactSection,
  EducationSection,
  ExperienceSection,
  ProjectsSection,
  SkillsSection,
  CertificationsSection,
  SummarySection,
} from "./FormSections";

const STEPS = [
  { key: "contact",        label: "Contact",        emoji: "👤" },
  { key: "education",      label: "Education",      emoji: "🎓" },
  { key: "experience",     label: "Experience",     emoji: "💼" },
  { key: "projects",       label: "Projects",       emoji: "🔨" },
  { key: "skills",         label: "Skills",         emoji: "⚡" },
  { key: "certifications", label: "Certifications", emoji: "📜" },
  { key: "summary",        label: "Summary",        emoji: "📝" },
];

const EMPTY_RESUME = {
  name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "",
  summary: "", education: [], experience: [], projects: [], skills: [], certifications: [], extras: {},
};

export default function ModuleB() {
  const [phase, setPhase] = useState("gallery"); // "gallery" | "editor"
  const [template, setTemplate] = useState("classic");
  const [step, setStep] = useState(0);
  const [resumeData, setResumeData] = useState({ ...EMPTY_RESUME });
  const [resumeId, setResumeId] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdRequirements, setJdRequirements] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // "idle" | "saving" | "saved"
  const [error, setError] = useState("");
  const [showJd, setShowJd] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const saveTimer = useRef(null);

  // Create builder session on mount
  useEffect(() => {
    (async () => {
      try {
        const { builder } = await import("../../services/api");
        const created = await builder.create({});
        setResumeId(created.id);
      } catch (err) {
        setError(`Could not start session: ${err.message}`);
      }
    })();
  }, []);

  // Auto-save on data change (debounced 1.5s)
  useEffect(() => {
    if (!resumeId) return;
    clearTimeout(saveTimer.current);
    setSaveState("idle");
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const { builder } = await import("../../services/api");
        await builder.update(resumeId, { resume_data: resumeData });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
      }
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [resumeData, resumeId]);

  function updateField(key, value) {
    setResumeData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSetJd() {
    if (!jdText.trim() || !resumeId) return;
    try {
      const { builder } = await import("../../services/api");
      const req = await builder.setJd(resumeId, jdText);
      setJdRequirements(req.requirements);
      setShowJd(false);
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Template gallery phase ─────────────────────────────────────────────
  if (phase === "gallery") {
    return (
      <div className="py-6">
        <TemplateGallery
          selected={template}
          onSelect={setTemplate}
          onContinue={() => setPhase("editor")}
        />
      </div>
    );
  }

  // ── Editor phase (split-screen) ───────────────────────────────────────
  const currentStep = STEPS[step];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("gallery")} className="text-xs text-gray-400 hover:text-blue-600">
            ← Templates
          </button>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-800">Resume Builder</span>
          {/* Save indicator */}
          <span className={`text-xs transition-opacity ${
            saveState === "saving" ? "text-gray-400 animate-pulse" :
            saveState === "saved"  ? "text-green-500" : "opacity-0"
          }`}>
            {saveState === "saving" ? "Saving…" : "✓ Saved"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* JD match toggle */}
          {!jdRequirements ? (
            <button onClick={() => setShowJd((s) => !s)} className="text-xs text-blue-600 hover:underline">
              + Add target JD
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ✓ JD loaded
              <button onClick={() => { setJdRequirements(null); setJdText(""); }} className="text-green-400 hover:text-green-700 ml-0.5">✕</button>
            </span>
          )}
          {/* Template switcher */}
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      {/* JD input dropdown */}
      {showJd && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex gap-3 items-end flex-shrink-0">
          <div className="flex-1">
            <label className="label text-xs mb-0.5">Paste target Job Description</label>
            <textarea
              className="input text-xs min-h-[60px]"
              placeholder="Paste the JD you're applying for — see your live match score as you type…"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button className="btn-primary text-xs" onClick={handleSetJd} disabled={!jdText.trim()}>Set JD</button>
            <button className="btn-secondary text-xs" onClick={() => setShowJd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      {/* ── Main split-screen ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Sidebar stepper + form */}
        <div className="flex flex-col w-[420px] flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden">

          {/* Sidebar steps */}
          <div className="flex flex-col gap-0.5 px-3 py-3 border-b border-gray-100 flex-shrink-0">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                    active ? "bg-blue-50 text-blue-700 font-semibold" :
                    done   ? "text-gray-600 hover:bg-gray-50" :
                             "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    active ? "bg-blue-600 text-white" :
                    done   ? "bg-green-500 text-white" :
                             "bg-gray-200 text-gray-500"
                  }`}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span>{s.emoji} {s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form area — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <StepContent step={currentStep.key} resumeData={resumeData} onUpdate={updateField} />
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <button
              className="btn-secondary text-sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >← Prev</button>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary text-sm" onClick={() => setStep((s) => s + 1)}>Next →</button>
            ) : (
              <button className="btn-primary text-sm" onClick={() => setShowExport(true)}>Export →</button>
            )}
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {/* JD score overlay */}
          {jdRequirements && (
            <LiveScoreBadge resumeData={resumeData} jdRequirements={jdRequirements} />
          )}
          <div className="p-4">
            <ResumePreview resumeData={resumeData} template={template} />
          </div>
        </div>
      </div>

      {/* ── Sticky export bar (always visible at bottom) ── */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-white border-t border-gray-200 shadow-md flex-shrink-0">
        <div className="text-xs text-gray-400">
          {resumeData.name || "Your Resume"} · ATS-safe export
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary text-xs py-1.5"
            onClick={() => setShowExport(true)}
            disabled={!resumeId}
          >
            📄 Export PDF
          </button>
          <button
            className="btn-secondary text-xs py-1.5"
            onClick={() => setShowExport(true)}
            disabled={!resumeId}
          >
            📝 Export DOCX
          </button>
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Export Resume</h3>
              <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <ExportPanel resumeId={resumeId} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live score badge in preview pane ──────────────────────────────────────
function LiveScoreBadge({ resumeData, jdRequirements }) {
  const [score, setScore] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const { scoring } = await import("../../services/api");
        const result = await scoring.scoreLive({ resume_data: resumeData, jd_requirements: jdRequirements });
        setScore(result.total_score);
      } catch {}
    }, 1000);
    return () => clearTimeout(timer.current);
  }, [resumeData, jdRequirements]);

  if (score === null) return null;

  const color = score >= 70 ? "bg-green-500" : score >= 45 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="sticky top-0 z-10 px-4 pt-3">
      <div className={`${color} text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow`}>
        JD Match: {score.toFixed(0)}/100
      </div>
    </div>
  );
}

// ── Step content switcher ─────────────────────────────────────────────────
function StepContent({ step, resumeData, onUpdate }) {
  switch (step) {
    case "contact":
      return (
        <ContactSection
          data={resumeData}
          onChange={(updated) => {
            ["name","email","phone","location","linkedin","github","website"].forEach(
              (f) => onUpdate(f, updated[f])
            );
          }}
        />
      );
    case "education":      return <EducationSection entries={resumeData.education} onChange={(v) => onUpdate("education", v)} />;
    case "experience":     return <ExperienceSection entries={resumeData.experience} onChange={(v) => onUpdate("experience", v)} />;
    case "projects":       return <ProjectsSection entries={resumeData.projects} onChange={(v) => onUpdate("projects", v)} />;
    case "skills":         return <SkillsSection skills={resumeData.skills} onChange={(v) => onUpdate("skills", v)} />;
    case "certifications": return <CertificationsSection certs={resumeData.certifications} onChange={(v) => onUpdate("certifications", v)} />;
    case "summary":        return <SummarySection summary={resumeData.summary} onChange={(v) => onUpdate("summary", v)} />;
    default:               return null;
  }
}
