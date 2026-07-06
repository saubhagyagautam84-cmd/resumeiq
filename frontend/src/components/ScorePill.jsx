export default function ScorePill({ score }) {
  const n = typeof score === "number" ? score : parseFloat(score ?? "");
  let gradient, color, shadow;
  if (n >= 85) {
    gradient = "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)";
    color    = "#fff";
    shadow   = "0 2px 6px rgba(34,197,94,0.30)";
  } else if (n >= 60) {
    gradient = "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
    color    = "#fff";
    shadow   = "0 2px 6px rgba(245,158,11,0.30)";
  } else {
    gradient = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
    color    = "#fff";
    shadow   = "0 2px 6px rgba(239,68,68,0.30)";
  }
  return (
    <span style={{
      background: isNaN(n) ? "#F4F4F5" : gradient,
      color: isNaN(n) ? "#71717A" : color,
      padding: "3px 11px", borderRadius: 20,
      fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
      boxShadow: isNaN(n) ? "none" : shadow,
      letterSpacing: -0.2,
    }}>
      {isNaN(n) ? "—" : `${Math.round(n)}%`}
    </span>
  );
}
