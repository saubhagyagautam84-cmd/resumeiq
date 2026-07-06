import { useState } from "react";

/**
 * Compact inline "✨ Improve" button that sits next to a textarea label.
 * Opens a small popover with input + suggestion — never auto-inserts.
 */
export default function InlineAI({ context = "", onAccept }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [edited, setEdited] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function rewrite() {
    if (!raw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { builder } = await import("../../services/api");
      const { rewritten } = await builder.rewriteBullet(raw, context);
      setSuggestion(rewritten);
      setEdited(rewritten);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function accept() {
    onAccept(edited || suggestion);
    setOpen(false);
    setRaw("");
    setSuggestion("");
    setEdited("");
  }

  function dismiss() {
    setOpen(false);
    setRaw("");
    setSuggestion("");
    setEdited("");
    setError("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
      >
        ✨ Improve with AI
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 w-72 bg-white border border-purple-100 rounded-xl shadow-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700">✨ AI Bullet Rewriter</span>
            <button type="button" onClick={dismiss} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          </div>

          <textarea
            className="input text-xs min-h-[52px]"
            placeholder="Type what you did (rough is fine)…"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) rewrite(); }}
          />

          <button
            type="button"
            className="w-full btn-primary text-xs py-1.5"
            onClick={rewrite}
            disabled={loading || !raw.trim()}
          >
            {loading ? "Rewriting…" : "Rewrite →"}
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {suggestion && (
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <textarea
                className="input text-xs min-h-[52px] bg-purple-50 border-purple-200"
                value={edited}
                onChange={(e) => setEdited(e.target.value)}
              />
              <div className="flex gap-1">
                <button type="button" className="btn-primary text-xs py-1 flex-1" onClick={accept}>✓ Insert</button>
                <button type="button" className="btn-secondary text-xs py-1" onClick={rewrite}>↺</button>
                <button type="button" className="btn-secondary text-xs py-1" onClick={() => { setSuggestion(""); setEdited(""); }}>✕</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
