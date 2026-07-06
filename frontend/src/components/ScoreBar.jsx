/**
 * Horizontal score bar with colour gradient (red → amber → green).
 */
export default function ScoreBar({ score, max = 100, size = "md" }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));

  const color =
    pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-amber-400" : "bg-red-400";

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${heights[size] || heights.md} overflow-hidden`}>
      <div
        className={`${color} ${heights[size] || heights.md} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
