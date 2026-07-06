import { useState } from "react";
import {
  IconHome2, IconBriefcase, IconFileAnalytics,
  IconPencil, IconChartBar,
} from "@tabler/icons-react";
import Home              from "./pages/Home";
import PostingsDashboard from "./pages/PostingsDashboard";
import Shortlisting      from "./pages/Shortlisting";
import ResumeBuilder     from "./pages/ResumeBuilder";
import Analytics         from "./pages/Analytics";
import useIsMobile       from "./hooks/useIsMobile";

const TABS = [
  { id: "home",         label: "Home",        Icon: IconHome2,         color: "#7F77DD" },
  { id: "postings",     label: "Postings",     Icon: IconBriefcase,     color: "#2E7AC9" },
  { id: "shortlisting", label: "Shortlist",    Icon: IconFileAnalytics, color: "#7F77DD" },
  { id: "builder",      label: "Builder",      Icon: IconPencil,        color: "#1D9E75" },
  { id: "analytics",    label: "Analytics",    Icon: IconChartBar,      color: "#BA7517" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const isMobile = useIsMobile();

  const pageContent = (
    <main style={{ paddingBottom: isMobile ? 68 : 0 }}>
      {tab === "home"         && <Home onNavigate={setTab} />}
      {tab === "postings"     && <PostingsDashboard onNavigate={setTab} />}
      {tab === "shortlisting" && <Shortlisting />}
      {tab === "builder"      && <ResumeBuilder isMobile={isMobile} />}
      {tab === "analytics"    && <Analytics />}
    </main>
  );

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh" }}>
        {/* Slim top bar — logo only */}
        <header style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.07)",
          height: 48, display: "flex", alignItems: "center",
          padding: "0 16px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div
            onClick={() => setTab("home")}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(83,74,183,0.40)",
            }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>R</span>
            </div>
            <span style={{
              fontSize: 15, fontWeight: 800, letterSpacing: -0.4,
              background: "linear-gradient(135deg, #7F77DD 0%, #26215C 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>ResumeIQ</span>
          </div>
        </header>

        {pageContent}

        {/* Fixed bottom nav */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "stretch",
          height: 60,
          zIndex: 200,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          {TABS.map(({ id, label, Icon, color }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 2px 4px",
                  color: active ? color : "#A1A1AA",
                  position: "relative",
                  transition: "color 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Active top indicator */}
                {active && (
                  <span style={{
                    position: "absolute", top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 24, height: 2.5, borderRadius: 2,
                    background: color,
                  }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: active ? `${color}18` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}>
                  <Icon size={20} stroke={active ? 2.3 : 1.6} />
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, lineHeight: 1 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 22px",
          display: "flex", alignItems: "center", gap: 8, height: 54,
        }}>
          {/* Logo */}
          <div
            onClick={() => setTab("home")}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: 12, flexShrink: 0 }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(83,74,183,0.40)",
            }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>R</span>
            </div>
            <span style={{
              fontSize: 16, fontWeight: 800, letterSpacing: -0.5,
              background: "linear-gradient(135deg, #7F77DD 0%, #26215C 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>ResumeIQ</span>
          </div>

          {/* Tabs */}
          <nav style={{ display: "flex", gap: 2, overflowX: "auto", flex: 1 }}>
            {TABS.map(({ id, label, Icon, color }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    background: active ? `${color}15` : "none",
                    border: "none", borderRadius: 8,
                    padding: "0 13px", height: 36,
                    fontSize: 13, fontWeight: active ? 700 : 400,
                    color: active ? color : "#71717A",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    position: "relative",
                  }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.background = "#F4F4F5"; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.background = "none"; }}
                >
                  <Icon size={14} stroke={active ? 2.4 : 1.8} color={active ? color : "#71717A"} />
                  {label}
                  {active && (
                    <span style={{
                      position: "absolute", bottom: -1, left: "50%",
                      transform: "translateX(-50%)",
                      width: 18, height: 2.5, borderRadius: 2,
                      background: color,
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {pageContent}
    </div>
  );
}
