import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

const METRIC_CONFIG = [
  { label: "Total applicants", value: "25",  trend: "+8 vs last month", trendDir: "up",      gradient: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)", shadow: "0 4px 16px rgba(83,74,183,0.25)", icon: "👥" },
  { label: "Shortlisted",      value: "11",  trend: "+3 vs last month", trendDir: "up",      gradient: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", shadow: "0 4px 16px rgba(15,110,86,0.22)",  icon: "✅" },
  { label: "Interviewed",      value: "6",   trend: "No change",        trendDir: "neutral", gradient: "linear-gradient(135deg, #2E7AC9 0%, #1A5A9A 100%)", shadow: "0 4px 16px rgba(46,122,201,0.22)", icon: "🎤" },
  { label: "Hired",            value: "1",   trend: "-1 vs last month", trendDir: "down",    gradient: "linear-gradient(135deg, #BA7517 0%, #7A4B0A 100%)", shadow: "0 4px 16px rgba(186,117,23,0.22)",  icon: "🏆" },
];

function MetricCard({ label, value, trend, trendDir, gradient, shadow, icon }) {
  const trendColor = trendDir === "up" ? "#1D9E75" : trendDir === "down" ? "#D85A30" : "#71717A";
  const TrendIcon  = trendDir === "up" ? IconTrendingUp : trendDir === "down" ? IconTrendingDown : IconMinus;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.05)",
      overflow: "hidden",
      transition: "transform 0.18s, box-shadow 0.18s",
    }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.08)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.05)"; }}
    >
      {/* Gradient top strip */}
      <div style={{ background: gradient, height: 5 }} />
      <div style={{ padding: "16px 20px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#71717A", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1, letterSpacing: -1,
            background: gradient,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>{value}</span>
        </div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11.5, fontWeight: 600, color: trendColor }}>
            <TrendIcon size={12} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

const FUNNEL = [
  { stage: "Applied",     count: 25, gradient: "linear-gradient(90deg, #7F77DD 0%, #9B96E8 100%)" },
  { stage: "Shortlisted", count: 11, gradient: "linear-gradient(90deg, #534AB7 0%, #7F77DD 100%)" },
  { stage: "Interviewed", count: 6,  gradient: "linear-gradient(90deg, #3C3489 0%, #534AB7 100%)" },
  { stage: "Offer",       count: 2,  gradient: "linear-gradient(90deg, #1D9E75 0%, #22B888 100%)" },
  { stage: "Hired",       count: 1,  gradient: "linear-gradient(90deg, #085041 0%, #1D9E75 100%)" },
];

function FunnelBar({ stage, count, gradient, maxCount, prev }) {
  const widthPct   = Math.round((count / maxCount) * 100);
  const conversion = prev != null ? `${Math.round((count / prev) * 100)}%` : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12.5, color: "#52525B", minWidth: 90, textAlign: "right", fontWeight: 500 }}>{stage}</span>
      <div style={{ flex: 1, height: 28, background: "#F4F3FF", borderRadius: 6, overflow: "hidden" }}>
        <div style={{
          width: `${widthPct}%`, height: "100%",
          background: gradient, borderRadius: 6,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", alignItems: "center", paddingLeft: 10,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}>
          {widthPct > 14 && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{count}</span>}
        </div>
      </div>
      <div style={{ minWidth: 64, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
        {widthPct <= 14 && <span style={{ fontSize: 12, fontWeight: 700, color: "#26215C" }}>{count}</span>}
        {conversion && (
          <span style={{ fontSize: 11, color: "#7F77DD", background: "#EEEDFE", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>
            {conversion}
          </span>
        )}
      </div>
    </div>
  );
}

const TIME_TABLE = [
  { posting: "Senior ML engineer", avgDays: 18, stages: { Screening: 3, Interview: 7, Offer: 6, Hired: 2 } },
  { posting: "Product designer",   avgDays: 12, stages: { Screening: 2, Interview: 5, Offer: 3, Hired: 2 } },
  { posting: "Support specialist", avgDays: 24, stages: { Screening: 4, Interview: 9, Offer: 7, Hired: 4 } },
];

export default function Analytics() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 20px 48px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5,
          background: "linear-gradient(135deg, #26215C 0%, #7F77DD 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Analytics</h2>
        <p style={{ fontSize: 13, color: "#71717A", margin: "5px 0 0 0" }}>Aggregate hiring metrics across all postings.</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {METRIC_CONFIG.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Hiring funnel */}
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.05)",
        padding: "22px 24px", marginBottom: 20,
      }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#26215C" }}>Hiring funnel</div>
          <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>
            Conversion at each stage — percentages show drop-off from previous step.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FUNNEL.map((f, i) => (
            <FunnelBar
              key={f.stage}
              stage={f.stage}
              count={f.count}
              gradient={f.gradient}
              maxCount={FUNNEL[0].count}
              prev={i > 0 ? FUNNEL[i - 1].count : null}
            />
          ))}
        </div>
      </div>

      {/* Time-to-hire table */}
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.05)",
        padding: "22px 24px", overflow: "hidden",
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#26215C" }}>Average time per stage</div>
          <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>Days spent in each stage per posting.</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{
                background: "linear-gradient(135deg, #F0EFFE 0%, #E8E5FF 100%)",
                borderRadius: 8,
              }}>
                {["Posting", "Avg. days to hire", "Screening", "Interview", "Offer", "Hired"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: 11.5, color: "#534AB7", fontWeight: 700,
                    borderBottom: "2px solid #C9C4FB",
                    letterSpacing: 0.3, textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_TABLE.map((row, i) => (
                <tr key={row.posting}
                  style={{ background: i % 2 ? "#FAFAF9" : "#fff", transition: "background 0.12s" }}
                  onMouseOver={e => (e.currentTarget.style.background = "#F5F3FF")}
                  onMouseOut={e => (e.currentTarget.style.background = i % 2 ? "#FAFAF9" : "#fff")}
                >
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "#26215C", borderBottom: "1px solid #F0F0EF" }}>{row.posting}</td>
                  <td style={{ padding: "11px 14px", borderBottom: "1px solid #F0F0EF" }}>
                    <span style={{
                      background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      fontWeight: 800, fontSize: 14,
                    }}>{row.avgDays}d</span>
                  </td>
                  {["Screening", "Interview", "Offer", "Hired"].map(s => (
                    <td key={s} style={{ padding: "11px 14px", color: "#52525B", borderBottom: "1px solid #F0F0EF" }}>
                      {row.stages[s] ?? "—"}d
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
