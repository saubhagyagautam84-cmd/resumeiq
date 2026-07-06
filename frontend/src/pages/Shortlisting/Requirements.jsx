import { useState } from "react";
import { IconListCheck, IconPlus } from "@tabler/icons-react";
import Tag from "../../components/Tag";

const VARIANTS = ["coral", "blue", "teal", "purple", "pink", "amber"];

export default function Requirements({ jobId, jobData, onNext }) {
  const init = jobData?.requirements ?? {};
  const [reqs, setReqs] = useState({
    required_skills:     init.required_skills     ?? [],
    preferred_skills:    init.preferred_skills    ?? [],
    min_experience_years: init.min_experience_years ?? 0,
    education_level:     init.education_level     ?? "",
    education_field:     init.education_field     ?? "",
    certifications:      init.certifications      ?? [],
  });
  const [newReq, setNewReq]  = useState("");
  const [newPref, setNewPref] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  function addSkill(type, val) {
    const v = val.trim(); if (!v) return;
    const key = type === "required" ? "required_skills" : "preferred_skills";
    if (!reqs[key].includes(v)) setReqs(r => ({ ...r, [key]: [...r[key], v] }));
  }

  function removeSkill(type, skill) {
    const key = type === "required" ? "required_skills" : "preferred_skills";
    setReqs(r => ({ ...r, [key]: r[key].filter(s => s !== skill) }));
  }

  async function save() {
    if (!jobId) { onNext(); return; }
    setSaving(true); setError("");
    try {
      const { jobs } = await import("../../services/api");
      await jobs.updateRequirements(jobId, reqs);
      onNext();
    } catch (err) {
      setError(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#FAECE7",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconListCheck size={18} color="#D85A30" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Review requirements</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>Edit or add to the auto-extracted requirements.</div>
        </div>
      </div>

      {/* Required skills */}
      <SkillGroup
        label="Required skills"
        skills={reqs.required_skills}
        input={newReq}
        onInput={setNewReq}
        onAdd={() => { addSkill("required", newReq); setNewReq(""); }}
        onRemove={s => removeSkill("required", s)}
        variantOffset={0}
      />

      {/* Preferred skills */}
      <SkillGroup
        label="Preferred skills"
        skills={reqs.preferred_skills}
        input={newPref}
        onInput={setNewPref}
        onAdd={() => { addSkill("preferred", newPref); setNewPref(""); }}
        onRemove={s => removeSkill("preferred", s)}
        variantOffset={2}
      />

      {/* Experience + Education */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="riq-label">Min experience (years)</label>
          <input
            className="riq-input" type="number" min={0} max={30}
            value={reqs.min_experience_years}
            onChange={e => setReqs(r => ({ ...r, min_experience_years: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className="riq-label">Education level</label>
          <select
            className="riq-input"
            value={reqs.education_level}
            onChange={e => setReqs(r => ({ ...r, education_level: e.target.value }))}
          >
            <option value="">Any</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD / Doctorate</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="riq-label">Education field</label>
          <input
            className="riq-input"
            placeholder="e.g. Computer Science, Statistics"
            value={reqs.education_field}
            onChange={e => setReqs(r => ({ ...r, education_field: e.target.value }))}
          />
        </div>
      </div>

      {error && <p style={{ color: "#D85A30", fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="riq-btn riq-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save & continue →"}
        </button>
      </div>
    </div>
  );
}

function SkillGroup({ label, skills, input, onInput, onAdd, onRemove, variantOffset }) {
  return (
    <div>
      <label className="riq-label" style={{ marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: skills.length ? 10 : 0 }}>
        {skills.map((s, i) => (
          <Tag key={s} label={s} variant={VARIANTS[(i + variantOffset) % VARIANTS.length]} onRemove={() => onRemove(s)} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="riq-input" style={{ flex: 1 }}
          placeholder={`Add ${label.toLowerCase().replace(" skills", "")} skill…`}
          value={input}
          onChange={e => onInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        />
        <button
          onClick={onAdd}
          style={{
            background: "#26215C", color: "#fff", border: "none",
            borderRadius: 8, padding: "0 14px", cursor: "pointer",
            display: "flex", alignItems: "center",
          }}
        >
          <IconPlus size={16} />
        </button>
      </div>
    </div>
  );
}
