import { useState } from "react";
import { IconFileAnalytics, IconPencil, IconCheck, IconArrowRight,
         IconUsers, IconTarget, IconBolt, IconShield,
         IconQuote, IconBrain, IconSparkles, IconPlayerPlay } from "@tabler/icons-react";

/* ── Template thumbnail mini-renderer ── */
function TemplateThumbnail({ type, active, onClick }) {
  const isClassic = type === "Classic";
  const isModern  = type === "Modern";

  const border = active ? "2px solid #1D9E75" : "2px solid #E4E4E7";
  const shadow = active ? "0 0 0 3px rgba(29,158,117,0.18)" : "none";

  return (
    <button
      onClick={onClick}
      title={type}
      style={{
        width: 62, height: 80, borderRadius: 6, border, boxShadow: shadow,
        background: "#fff", overflow: "hidden", cursor: "pointer",
        padding: 0, transition: "all 0.15s", flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Classic: serif-style, left-ruled header */}
      {isClassic && (
        <div style={{ padding: "5px 5px 4px" }}>
          <div style={{ height: 3, background: "#26215C", borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 2, width: "60%", background: "#A1A1AA", borderRadius: 1, marginBottom: 4 }} />
          {[80, 65, 90, 55, 70, 45].map((w, i) => (
            <div key={i} style={{ height: 1.5, width: `${w}%`, background: "#D4D4D8", borderRadius: 1, marginBottom: 2 }} />
          ))}
          <div style={{ height: 2, background: "#E4E4E7", margin: "4px 0 3px" }} />
          {[70, 55, 80].map((w, i) => (
            <div key={i} style={{ height: 1.5, width: `${w}%`, background: "#D4D4D8", borderRadius: 1, marginBottom: 2 }} />
          ))}
        </div>
      )}
      {/* Modern: purple header block */}
      {isModern && (
        <div>
          <div style={{ background: "linear-gradient(135deg, #7F77DD, #534AB7)", padding: "6px 5px 5px" }}>
            <div style={{ height: 2.5, width: "70%", background: "rgba(255,255,255,0.9)", borderRadius: 1, marginBottom: 2 }} />
            <div style={{ height: 1.5, width: "45%", background: "rgba(255,255,255,0.55)", borderRadius: 1 }} />
          </div>
          <div style={{ padding: "4px 5px" }}>
            {[75, 55, 85, 60, 40, 70].map((w, i) => (
              <div key={i} style={{ height: 1.5, width: `${w}%`, background: "#D4D4D8", borderRadius: 1, marginBottom: 2 }} />
            ))}
          </div>
        </div>
      )}
      {/* Minimal: ultra-clean, thin accent line */}
      {!isClassic && !isModern && (
        <div style={{ padding: "5px 5px 4px" }}>
          <div style={{ height: 2, width: "55%", background: "#18181B", borderRadius: 1, marginBottom: 1 }} />
          <div style={{ height: 1.5, width: "35%", background: "#A1A1AA", borderRadius: 1, marginBottom: 4 }} />
          <div style={{ height: 1, background: "#E4E4E7", marginBottom: 4 }} />
          {[80, 60, 75, 50, 65, 45].map((w, i) => (
            <div key={i} style={{ height: 1.5, width: `${w}%`, background: "#D4D4D8", borderRadius: 1, marginBottom: 2 }} />
          ))}
        </div>
      )}
      {/* Active tick */}
      {active && (
        <div style={{
          position: "absolute", bottom: 3, right: 3,
          width: 14, height: 14, borderRadius: "50%",
          background: "#1D9E75",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconCheck size={8} color="#fff" stroke={3} />
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", fontSize: 8, fontWeight: 600, color: active ? "#0F6E56" : "#71717A", padding: "2px 0 3px", background: active ? "#E1F5EE" : "#F4F4F5" }}>
        {type}
      </div>
    </button>
  );
}

const TESTIMONIALS = [
  { name: "Priya M.", role: "HR Lead · TechCorp",   avatar: "PM", color: "#7F77DD", quote: "We cut screening time from 3 days to under an hour. The bias audit alone sold it for our team." },
  { name: "Amir K.",  role: "Job seeker · hired at Stripe", avatar: "AK", color: "#1D9E75", quote: "Live JD scoring told me exactly what to add. My interview callback rate doubled." },
  { name: "Sara L.",  role: "Recruiter · Agency",   avatar: "SL", color: "#2E7AC9", quote: "The pipeline board replaced our spreadsheet. Finally a tool that handles the whole workflow." },
];

const DEMO_STEPS = [
  { label: "Paste job description",  icon: "📋", desc: "AI auto-extracts must-have skills, years of experience, education" },
  { label: "Upload résumés",         icon: "📤", desc: "Drag-drop multiple PDFs; duplicates are flagged instantly" },
  { label: "Get ranked results",     icon: "🏆", desc: "Scores appear in < 30s with matched vs missing skills highlighted" },
];

const MODULES = [
  {
    id: "shortlisting",
    Icon: IconFileAnalytics,
    gradient: "linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)",
    lightBg:  "#EEEDFE",
    accentText:"#26215C",
    checkColor:"#7F77DD",
    title:    "Resume shortlisting",
    subtitle: "For recruiters — score & rank applicants in minutes",
    badge:    { label: "Bias-aware scoring", color: "#BA7517", bg: "#FEF3E2", border: "#F5D28A" },
    bullets: [
      "Auto-extract JD requirements with AI",
      "Configurable scoring weights per role",
      "Ranked results with bias audit",
      "Pipeline tracking + CSV export",
    ],
    btnGradient: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
    btnShadow:   "0 4px 14px rgba(83,74,183,0.35)",
    btnLabel:    "Open shortlisting",
  },
  {
    id: "builder",
    Icon: IconPencil,
    gradient: "linear-gradient(135deg, #1D9E75 0%, #085041 100%)",
    lightBg:  "#E1F5EE",
    accentText:"#04342C",
    checkColor:"#1D9E75",
    title:    "Resume builder",
    subtitle: "For candidates — build an ATS-ready resume",
    badge:    null,
    bullets: [
      "Live JD-match scoring as you type",
      "AI bullet rewriter (Groq LLM)",
      "Export PDF or DOCX — ATS-safe",
    ],
    btnGradient: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
    btnShadow:   "0 4px 14px rgba(15,110,86,0.30)",
    btnLabel:    "Open builder",
    showTemplates: true,
  },
];

const STATS = [
  { icon: IconUsers,  value: "500+",  label: "JDs processed" },
  { icon: IconTarget, value: "94%",   label: "ATS pass rate" },
  { icon: IconBolt,   value: "< 30s", label: "Avg. scoring time" },
  { icon: IconShield, value: "100%",  label: "Bias-audited" },
];

export default function Home({ onNavigate }) {
  const [activeTemplate, setActiveTemplate] = useState("Modern");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 22px 56px" }}>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <div style={{ textAlign: "center", padding: "64px 20px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(127,119,221,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 40, right: "10%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(127,119,221,0.1)", border: "1px solid rgba(127,119,221,0.25)",
          borderRadius: 20, padding: "5px 14px", marginBottom: 22,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7F77DD", display: "inline-block", animation: "pulse-ring 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#534AB7" }}>AI-powered · Free to use</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 900,
          lineHeight: 1.1, letterSpacing: -1.5, margin: "0 0 18px",
          background: "linear-gradient(135deg, #26215C 0%, #7F77DD 50%, #1D9E75 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          ResumeIQ
        </h1>

        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#52525B", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.65 }}>
          Two powerful tools, one platform — shortlist smarter as a recruiter, or build a job-winning resume as a candidate.
        </p>

        {/* Trust badges row */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 30 }}>
          {[
            { icon: "🛡️", text: "Bias-aware scoring" },
            { icon: "⚡", text: "Results in < 30s" },
            { icon: "📄", text: "ATS-optimized" },
          ].map(b => (
            <span key={b.text} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.80)", backdropFilter: "blur(8px)",
              border: "1px solid #E4E4E7", borderRadius: 20,
              padding: "4px 12px", fontSize: 12, fontWeight: 500, color: "#3F3F46",
            }}>
              {b.icon} {b.text}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("shortlisting")} style={{
            background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
            color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(83,74,183,0.35)",
            display: "flex", alignItems: "center", gap: 7, transition: "all 0.18s",
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(83,74,183,0.45)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(83,74,183,0.35)"; }}
          >
            Start shortlisting <IconArrowRight size={16} />
          </button>
          <button onClick={() => onNavigate("builder")} style={{
            background: "#fff", color: "#26215C", border: "1.5px solid #E4E4E7",
            padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", gap: 7, transition: "all 0.18s",
          }}
            onMouseOver={e => { e.currentTarget.style.background = "#F0EFFE"; e.currentTarget.style.borderColor = "#7F77DD"; }}
            onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E4E4E7"; }}
          >
            Build my resume <IconArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SOCIAL PROOF — TESTIMONIALS
      ══════════════════════════════════════ */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#A1A1AA", textTransform: "uppercase", marginBottom: 4 }}>
            Trusted by recruiters &amp; job seekers
          </div>
          <div style={{ fontSize: 14, color: "#71717A" }}>
            Used by <strong style={{ color: "#26215C" }}>500+ recruiters</strong> and candidates across industries
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background: "#fff", borderRadius: 14,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
              padding: "18px 20px",
              borderTop: `3px solid ${t.color}`,
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.06), 0 10px 26px rgba(0,0,0,0.08)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)"; }}
            >
              <IconQuote size={18} color={t.color} style={{ opacity: 0.5, marginBottom: 8 }} />
              <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#3F3F46", lineHeight: 1.6, fontStyle: "italic" }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `${t.color}22`, border: `2px solid ${t.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: t.color, flexShrink: 0,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#18181B" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#71717A" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          SEE IT IN ACTION — DEMO WALKTHROUGH
      ══════════════════════════════════════ */}
      <div style={{
        background: "#fff", borderRadius: 18,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.07)",
        overflow: "hidden", marginBottom: 44,
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #F0EFFE 0%, #E8E5FF 100%)",
          borderBottom: "1px solid #C9C4FB",
          padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #7F77DD, #534AB7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconPlayerPlay size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#26215C" }}>See it in action</div>
              <div style={{ fontSize: 12, color: "#71717A" }}>How shortlisting works — from JD to ranked results in 3 steps</div>
            </div>
          </div>
          <button onClick={() => onNavigate("shortlisting")} style={{
            background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 3px 10px rgba(83,74,183,0.30)", fontFamily: "inherit",
          }}>
            Try it now <IconArrowRight size={13} />
          </button>
        </div>

        {/* Steps */}
        <div style={{ padding: "24px 24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {DEMO_STEPS.map((step, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{
                  background: "linear-gradient(135deg, #F5F3FF 0%, #EEEDFE 100%)",
                  border: "1.5px solid #C9C4FB", borderRadius: 12, padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{step.icon}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg, #7F77DD, #534AB7)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff",
                    }}>{i + 1}</div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#26215C", marginBottom: 5 }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: "#71717A", lineHeight: 1.5 }}>{step.desc}</div>
                </div>
                {/* Arrow connector */}
                {i < DEMO_STEPS.length - 1 && (
                  <div style={{
                    display: "none",
                    position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)",
                    fontSize: 18, color: "#C9C4FB", zIndex: 2,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Mini score demo visual */}
          <div style={{
            marginTop: 20, background: "#FAFAFA", borderRadius: 10,
            border: "1px solid #E4E4E7", padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 12, color: "#71717A", fontWeight: 600 }}>Sample output:</div>
            {[
              { name: "Aisha Rahman",  score: 91, skills: "Python, ML, PyTorch", match: "✅" },
              { name: "Jordan Lee",    score: 74, skills: "Python, SQL, TensorFlow", match: "⚠️" },
              { name: "Chris Wang",    score: 52, skills: "Java, Spring, REST APIs", match: "❌" },
            ].map(c => (
              <div key={c.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff", border: "1px solid #E4E4E7",
                borderRadius: 8, padding: "7px 12px", fontSize: 12,
              }}>
                <span>{c.match}</span>
                <span style={{ fontWeight: 600, color: "#18181B" }}>{c.name}</span>
                <span style={{
                  background: c.score >= 85 ? "linear-gradient(135deg,#22C55E,#16A34A)" : c.score >= 60 ? "linear-gradient(135deg,#F59E0B,#D97706)" : "linear-gradient(135deg,#EF4444,#DC2626)",
                  color: "#fff", borderRadius: 12, padding: "2px 8px", fontWeight: 700, fontSize: 11,
                }}>{c.score}%</span>
                <span style={{ color: "#A1A1AA" }}>{c.skills}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODULE CARDS
      ══════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22, marginBottom: 22 }}>
        {MODULES.map(m => {
          const { Icon } = m;
          return (
            <div key={m.id} style={{
              background: "#fff", borderRadius: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.07)",
              overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.10)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.07)"; }}
            >
              {/* Gradient banner */}
              <div style={{ background: m.gradient, padding: "22px 24px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                  <Icon size={24} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{m.title}</div>
                    {/* Bias-aware badge on shortlisting */}
                    {m.badge && (
                      <span style={{
                        background: m.badge.bg, color: m.badge.color,
                        border: `1px solid ${m.badge.border}`,
                        borderRadius: 20, padding: "2px 8px",
                        fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                      }}>
                        🛡️ {m.badge.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{m.subtitle}</div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 24px 24px" }}>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: m.showTemplates ? 14 : 22 }}>
                  {m.bullets.map((b, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: m.accentText, lineHeight: 1.4 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: m.lightBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <IconCheck size={11} color={m.checkColor} stroke={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Template thumbnails for builder */}
                {m.showTemplates && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                      Pick a template
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Classic", "Modern", "Minimal"].map(tpl => (
                        <TemplateThumbnail
                          key={tpl}
                          type={tpl}
                          active={activeTemplate === tpl}
                          onClick={() => setActiveTemplate(tpl)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => onNavigate(m.id)} style={{
                  width: "100%", background: m.btnGradient, color: "#fff", border: "none",
                  padding: "11px 0", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: m.btnShadow,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "all 0.18s", fontFamily: "inherit",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.filter = "brightness(1.08)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
                >
                  {m.btnLabel} <IconArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          SHARED ENGINE CONNECTOR STRIP
      ══════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #0F0C29 0%, #26215C 50%, #085041 100%)",
        borderRadius: 16,
        padding: "24px 32px",
        marginBottom: 22,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        boxShadow: "0 8px 28px rgba(15,12,41,0.30)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: -40, right: "20%", width: 180, height: 180, borderRadius: "50%", background: "rgba(127,119,221,0.12)", pointerEvents: "none" }} />
        <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(4px)" }}>
          <IconBrain size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            One AI engine. Both sides of the table.
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            Recruiters set the bar, candidates aim for it — same AI, same scoring logic.
            Your resume is optimized for <em>exactly</em> how recruiters score it.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(127,119,221,0.20)", border: "1px solid rgba(127,119,221,0.35)", borderRadius: 8, padding: "6px 12px" }}>
            <IconFileAnalytics size={13} color="#9B96E8" />
            <span style={{ fontSize: 12, color: "#C5C0F5", fontWeight: 600 }}>Recruiter</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.30)", alignSelf: "center", fontSize: 16 }}>⇄</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(29,158,117,0.20)", border: "1px solid rgba(29,158,117,0.35)", borderRadius: 8, padding: "6px 12px" }}>
            <IconPencil size={13} color="#6EE7C0" />
            <span style={{ fontSize: 12, color: "#6EE7C0", fontWeight: 600 }}>Candidate</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #26215C 0%, #534AB7 100%)",
        borderRadius: 16, padding: "28px 36px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 20, boxShadow: "0 8px 28px rgba(38,33,92,0.25)",
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <s.icon size={20} color="rgba(255,255,255,0.6)" style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
