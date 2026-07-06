const VARIANTS = {
  purple: { background: "#EEEDFE", color: "#26215C" },
  teal:   { background: "#E1F5EE", color: "#085041" },
  coral:  { background: "#FAECE7", color: "#712B13" },
  blue:   { background: "#E6F1FB", color: "#0C447C" },
  pink:   { background: "#FBEAF0", color: "#72243E" },
  amber:  { background: "#FAEEDA", color: "#633806" },
};

export default function Tag({ label, variant = "purple", onRemove }) {
  const style = VARIANTS[variant] ?? VARIANTS.purple;
  return (
    <span style={{
      ...style,
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 500, lineHeight: "18px", whiteSpace: "nowrap",
    }}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "0 1px", color: "inherit", lineHeight: 1,
            fontSize: 14, opacity: 0.65,
          }}
        >×</button>
      )}
    </span>
  );
}
