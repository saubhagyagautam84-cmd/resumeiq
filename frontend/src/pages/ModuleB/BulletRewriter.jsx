import { useState } from "react";

/**
 * AI bullet point rewriter widget.
 * Shows a compact input + "Rewrite" button.
 * Returns suggestion with Accept / Edit / Regenerate options.
 * Never auto-inserts — always requires explicit confirmation.
 */
export default function BulletRewriter({ context = "", onAccept }) {
  const [raw, setRaw] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [edited, setEdited] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleRewrite(textToRewrite) {
    if (!textToRewrite?.trim()) return setError("Please enter something to rewrite.");
    setLoading(true);
    setError("");
    setSuggestion("");
    setEdited("");
    try {
      const { builder } = await import("../../services/api");
      const { rewritten } = await builder.rewriteBullet(textToRewrite, context);
      setSuggestion(rewritten);
      setEdited(rewritten);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    onAccept(edited || suggestion);
    setSuggestion("");
    setEdited("");
    setRaw("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        onClick={() => setOpen(true)}
      >
        ✨ AI Bullet Rewriter
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">✨ AI Bullet Rewriter</span>
        <button type="button" className="text-blue-400 hover:text-blue-600 text-xs" onClick={() => { setOpen(false); setError(""); setSuggestion(""); }}>✕</button>
      </div>

      <div>
        <label className="label text-blue-700">Rough description of what you did:</label>
        <textarea
          className="input min-h-[60px] text-sm"
          placeholder="e.g. worked on the backend API, helped improve performance"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="btn-primary text-xs"
        onClick={() => handleRewrite(raw)}
        disabled={loading || !raw.trim()}
      >
        {loading ? "Rewriting…" : "Rewrite →"}
      </button>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {suggestion && (
        <div className="space-y-2">
          <label className="label text-blue-700">Suggestion (edit if needed):</label>
          <textarea
            className="input min-h-[60px] text-sm bg-white"
            value={edited}
            onChange={(e) => setEdited(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className="btn-primary text-xs" onClick={handleAccept}>
              ✓ Accept &amp; Insert
            </button>
            <button type="button" className="btn-secondary text-xs" onClick={() => handleRewrite(raw)}>
              ↺ Regenerate
            </button>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setSuggestion(""); setEdited(""); }}>
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
