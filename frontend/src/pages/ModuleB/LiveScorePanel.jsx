import { useState, useEffect, useRef } from "react";
import ScoreBar from "../../components/ScoreBar";

const FACTOR_LABELS = {
  education: "🎓 Education",
  experience: "💼 Experience",
  projects: "🔨 Projects",
  skills: "⚡ Skills Match",
  certifications: "📜 Certifications",
  extras: "✨ Extras",
};

/**
 * Live JD-match feedback panel for Module B.
 * Debounces score updates so the API isn't hammered on every keystroke.
 * Highlights weak sections with actionable tips.
 */
export default function LiveScorePanel({ resumeData, jdRequirements }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!jdRequirements || !resumeData) return;

    // Debounce 800ms so we don't fire on every keystroke
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { scoring } = await import("../../services/api");
        const result = await scoring.scoreLive({
          resume_data: resumeData,
          jd_requirements: jdRequirements,
        });
        setScore(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [resumeData, jdRequirements]);

  if (!jdRequirements) return null;

  return (
    <div className="card p-4 space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Live JD Match</h3>
        {loading && <span className="text-xs text-blue-500 animate-pulse">Updating…</span>}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {score ? (
        <>
          {/* Total score */}
          <div className="text-center py-2">
            <div className={`text-4xl font-bold ${
              score.total_score >= 70 ? "text-green-600" : score.total_score >= 45 ? "text-amber-600" : "text-red-500"
            }`}>
              {score.total_score.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">/ 100</div>
            <div className="mt-2">
              <ScoreBar score={score.total_score} size="lg" />
            </div>
          </div>

          {/* Per-factor */}
          <div className="space-y-2.5">
            {Object.entries(score.breakdown).map(([factor, data]) => (
              <FactorRow key={factor} factor={factor} data={data} />
            ))}
          </div>

          {/* Warnings */}
          {score.warnings?.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-gray-100">
              {score.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">⚠️ {w}</p>
              ))}
            </div>
          )}
        </>
      ) : (
        !loading && (
          <p className="text-xs text-gray-400 text-center py-4">
            Fill in your resume to see your live match score.
          </p>
        )
      )}
    </div>
  );
}

function FactorRow({ factor, data }) {
  const label = FACTOR_LABELS[factor] || factor;
  const { score, explanation } = data;
  const weak = score < 50;

  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className={`text-xs ${weak ? "text-amber-600 font-medium" : "text-gray-600"}`}>{label}</span>
        <span className={`text-xs font-bold ${weak ? "text-amber-600" : "text-gray-700"}`}>{score.toFixed(0)}</span>
      </div>
      <ScoreBar score={score} size="sm" />
      {weak && (
        <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">{explanation}</p>
      )}
    </div>
  );
}
