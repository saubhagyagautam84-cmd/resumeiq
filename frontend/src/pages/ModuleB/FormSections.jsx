import { useState, useRef } from "react";
import InlineAI from "./InlineAI";

/** Tooltip helper */
function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="text-gray-400 hover:text-blue-500 text-xs leading-none"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ⓘ
      </button>
      {show && (
        <div className="absolute z-50 left-0 top-5 w-56 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
          {text}
        </div>
      )}
    </span>
  );
}

// ── Contact Info ──────────────────────────────────────────────────────────

export function ContactSection({ data, onChange }) {
  const fields = [
    { key: "name",     label: "Full Name",   placeholder: "e.g. Jane Smith" },
    { key: "email",    label: "Email",        placeholder: "jane@example.com" },
    { key: "phone",    label: "Phone",        placeholder: "+1 (555) 000-0000" },
    { key: "location", label: "Location",     placeholder: "City, State" },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/janesmith" },
    { key: "github",   label: "GitHub URL",   placeholder: "github.com/janesmith" },
    { key: "website",  label: "Portfolio URL", placeholder: "janesmith.dev (optional)" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className={key === "name" ? "col-span-2" : ""}>
          <label className="label">{label}</label>
          <input
            className="input"
            placeholder={placeholder}
            value={data[key] || ""}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

// ── Education ─────────────────────────────────────────────────────────────

export function EducationSection({ entries, onChange }) {
  function update(i, field, val) {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange(next);
  }
  function add() {
    onChange([...entries, { degree: "", field: "", institution: "", year_start: "", year_end: "", gpa: "" }]);
  }
  function remove(i) { onChange(entries.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    const next = [...entries];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Entry {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" className="btn-secondary text-xs py-0.5 px-2" onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="btn-secondary text-xs py-0.5 px-2" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="text-red-400 hover:text-red-600 text-xs ml-1" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Degree <Tip text="e.g. Bachelor of Science, Master of Business Administration" /></label>
              <input className="input" placeholder="e.g. Bachelor of Science" value={entry.degree || ""} onChange={(e) => update(i, "degree", e.target.value)} />
            </div>
            <div>
              <label className="label">Field of Study</label>
              <input className="input" placeholder="e.g. Computer Science" value={entry.field || ""} onChange={(e) => update(i, "field", e.target.value)} />
            </div>
            <div>
              <label className="label">Institution</label>
              <input className="input" placeholder="e.g. MIT" value={entry.institution || ""} onChange={(e) => update(i, "institution", e.target.value)} />
            </div>
            <div>
              <label className="label">Start Year</label>
              <input className="input" type="number" min="1950" max="2030" placeholder="2018" value={entry.year_start || ""} onChange={(e) => update(i, "year_start", e.target.value ? parseInt(e.target.value) : "")} />
            </div>
            <div>
              <label className="label">End Year</label>
              <input className="input" type="number" min="1950" max="2030" placeholder="2022" value={entry.year_end || ""} onChange={(e) => update(i, "year_end", e.target.value ? parseInt(e.target.value) : "")} />
            </div>
            <div>
              <label className="label">GPA <Tip text="Optional — include only if strong (3.5+ on 4.0 scale)" /></label>
              <input className="input" placeholder="3.8" value={entry.gpa || ""} onChange={(e) => update(i, "gpa", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn-secondary text-sm" onClick={add}>+ Add Education</button>
    </div>
  );
}

// ── Experience ────────────────────────────────────────────────────────────

export function ExperienceSection({ entries, onChange }) {
  function update(i, field, val) {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange(next);
  }
  function add() {
    onChange([...entries, { title: "", company: "", start_date: "", end_date: "", is_current: false, description: "", skills_mentioned: [], duration_months: null }]);
  }
  function remove(i) { onChange(entries.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    const next = [...entries];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Position {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" className="btn-secondary text-xs py-0.5 px-2" onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="btn-secondary text-xs py-0.5 px-2" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="text-red-400 hover:text-red-600 text-xs ml-1" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Title <Tip text="e.g. Software Engineer, Product Manager" /></label>
              <input className="input" placeholder="Senior Software Engineer" value={entry.title || ""} onChange={(e) => update(i, "title", e.target.value)} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" placeholder="Google" value={entry.company || ""} onChange={(e) => update(i, "company", e.target.value)} />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input className="input" placeholder="Jan 2020" value={entry.start_date || ""} onChange={(e) => update(i, "start_date", e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input className="input" placeholder="Dec 2022 or Present" value={entry.end_date || ""} disabled={entry.is_current} onChange={(e) => update(i, "end_date", e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id={`current-${i}`} checked={entry.is_current || false} onChange={(e) => { update(i, "is_current", e.target.checked); if (e.target.checked) update(i, "end_date", "Present"); }} />
              <label htmlFor={`current-${i}`} className="text-sm text-gray-600">Currently working here</label>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">
                  Description <Tip text="Use bullet points. One achievement per line works well." />
                </label>
                <InlineAI
                  context={[entry.title, entry.company].filter(Boolean).join(" at ")}
                  onAccept={(bullet) => update(i, "description", (entry.description ? entry.description + "\n" : "") + bullet)}
                />
              </div>
              <textarea
                className="input min-h-[100px]"
                placeholder={"• Led a team of 5 engineers to build...\n• Reduced deployment time by 40% by..."}
                value={entry.description || ""}
                onChange={(e) => update(i, "description", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn-secondary text-sm" onClick={add}>+ Add Position</button>
    </div>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────

export function ProjectsSection({ entries, onChange }) {
  function update(i, field, val) {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange(next);
  }
  function add() {
    onChange([...entries, { title: "", description: "", skills: [], links: [] }]);
  }
  function remove(i) { onChange(entries.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Project {i + 1}</span>
            <button type="button" className="text-red-400 hover:text-red-600 text-xs" onClick={() => remove(i)}>✕</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Project Name</label>
              <input className="input" placeholder="e.g. E-commerce Recommendation Engine" value={entry.title || ""} onChange={(e) => update(i, "title", e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Description <Tip text="What problem did it solve? What was your role? What was the impact?" /></label>
                <InlineAI context={entry.title} onAccept={(b) => update(i, "description", (entry.description ? entry.description + "\n" : "") + b)} />
              </div>
              <textarea className="input min-h-[80px]" placeholder="Built a real-time recommendation system using collaborative filtering…" value={entry.description || ""} onChange={(e) => update(i, "description", e.target.value)} />
            </div>
            <div>
              <label className="label">Technologies Used <Tip text="Comma-separated. e.g. Python, React, PostgreSQL" /></label>
              <input className="input" placeholder="Python, TensorFlow, AWS" value={(entry.skills || []).join(", ")} onChange={(e) => update(i, "skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
            <div>
              <label className="label">Links <Tip text="GitHub URL or live demo link — very helpful for credibility" /></label>
              <input className="input" placeholder="github.com/you/project-name" value={(entry.links || []).join(", ")} onChange={(e) => update(i, "links", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="btn-secondary text-sm" onClick={add}>+ Add Project</button>
    </div>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────

export function SkillsSection({ skills, onChange }) {
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed)) return setInput("");
    onChange([...skills, trimmed]);
    setInput("");
  }

  function removeSkill(s) {
    onChange(skills.filter((x) => x !== s));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        List technical and soft skills. Be specific — "React" is better than "Frontend Development".
      </p>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Add a skill (e.g. Python, React, Project Management)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
        />
        <button type="button" className="btn-secondary text-sm" onClick={addSkill}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
            {s}
            <button type="button" className="text-blue-400 hover:text-blue-700 leading-none" onClick={() => removeSkill(s)}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Certifications ────────────────────────────────────────────────────────

export function CertificationsSection({ certs, onChange }) {
  const [input, setInput] = useState("");

  function add() {
    const t = input.trim();
    if (!t || certs.includes(t)) return setInput("");
    onChange([...certs, t]);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="e.g. AWS Solutions Architect, PMP, Google Cloud Professional"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn-secondary text-sm" onClick={add}>Add</button>
      </div>
      <ul className="space-y-1">
        {certs.map((c, i) => (
          <li key={i} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
            <span>📜 {c}</span>
            <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => onChange(certs.filter((_, j) => j !== i))}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────

export function SummarySection({ summary, onChange }) {
  return (
    <div>
      <label className="label">
        Professional Summary
        <Tip text="3–5 sentences. Who you are, your specialty, and what you bring. ATS systems read this section carefully." />
      </label>
      <textarea
        className="input min-h-[120px]"
        placeholder={"Results-driven software engineer with 5+ years building scalable web applications. " +
          "Expertise in React, Node.js, and AWS. Passionate about clean architecture and developer experience."}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-gray-400 mt-1">{summary.length} characters</p>
    </div>
  );
}
