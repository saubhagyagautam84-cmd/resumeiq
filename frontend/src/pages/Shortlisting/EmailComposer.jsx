import { useState } from "react";
import { IconX, IconSend } from "@tabler/icons-react";

const TEMPLATES = {
  "Interview invite": {
    subject: "Interview invitation — we'd love to chat",
    body:
      "Hi [Name],\n\nHope you're doing well! We were genuinely impressed by your background and would love to invite you to a conversation about the role.\n\nWould any of the following times work for a 30-minute call?\n\n- [Day], [Date] at [Time]\n- [Day], [Date] at [Time]\n\nFeel free to reply with what works best, or suggest an alternative — we're flexible.\n\nLooking forward to connecting!\n\nWarm regards,\n[Your name]",
  },
  "Rejection — polite": {
    subject: "Your application — thank you for applying",
    body:
      "Hi [Name],\n\nThank you so much for taking the time to apply and for the thought you put into your application. It was a genuinely competitive pool and this was a difficult decision.\n\nUnfortunately, we won't be moving forward with your application for this particular role, but we were impressed by your experience and would encourage you to apply for future openings.\n\nWe genuinely appreciate your interest and wish you all the best in your search.\n\nWarmly,\n[Your name]",
  },
  "Offer letter intro": {
    subject: "Great news about your application 🎉",
    body:
      "Hi [Name],\n\nI'm really excited to share some great news — we'd love to extend you an offer!\n\nAfter our conversations, the team is confident you'd be a fantastic fit, and we're genuinely looking forward to the possibility of working together.\n\nI'll be sending over the formal offer letter shortly, but wanted to reach out personally first. Please don't hesitate to ask any questions — there are no silly ones at this stage.\n\nCongratulations, and I hope to have you on board soon!\n\nBest,\n[Your name]",
  },
};

const TEMPLATE_KEYS = Object.keys(TEMPLATES);

export default function EmailComposer({ candidate, onClose }) {
  const [tplKey,   setTplKey]   = useState(TEMPLATE_KEYS[0]);
  const [subject,  setSubject]  = useState(TEMPLATES[TEMPLATE_KEYS[0]].subject);
  const [body,     setBody]     = useState(TEMPLATES[TEMPLATE_KEYS[0]].body);
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);

  function selectTemplate(key) {
    setTplKey(key);
    setSubject(TEMPLATES[key].subject);
    setBody(TEMPLATES[key].body);
  }

  async function send() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900)); // mock send delay
    setSending(false);
    setSent(true);
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300 }}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(560px, 95vw)", maxHeight: "88vh",
        background: "#fff", borderRadius: 14,
        boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
        zIndex: 301, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #E8E7E2" }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#26215C" }}>
            Send email{candidate?.name ? ` — ${candidate.name}` : ""}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9A97", padding: 3 }}>
            <IconX size={17} />
          </button>
        </div>

        {sent ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 40 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconSend size={22} color="#1D9E75" />
            </div>
            <p style={{ fontWeight: 600, color: "#085041", margin: 0 }}>Email sent!</p>
            <p style={{ fontSize: 13, color: "#5F5E5A", margin: 0 }}>Your message has been sent to {candidate?.name ?? "the candidate"}.</p>
            <button className="riq-btn riq-btn-secondary" onClick={onClose} style={{ marginTop: 8 }}>Close</button>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Template picker */}
            <div>
              <label className="riq-label" htmlFor="email-template">Template</label>
              <select
                id="email-template"
                className="riq-input"
                value={tplKey}
                onChange={e => selectTemplate(e.target.value)}
              >
                {TEMPLATE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="riq-label" htmlFor="email-subject">Subject</label>
              <input
                id="email-subject"
                className="riq-input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div style={{ flex: 1 }}>
              <label className="riq-label" htmlFor="email-body">Message</label>
              <textarea
                id="email-body"
                className="riq-input"
                style={{ minHeight: 220 }}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="riq-btn riq-btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="riq-btn riq-btn-primary"
                onClick={send}
                disabled={sending || !subject.trim() || !body.trim()}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IconSend size={14} />
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
