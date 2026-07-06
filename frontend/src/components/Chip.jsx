export default function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)"
          : "#F4F3FF",
        color:   active ? "#fff" : "#52525B",
        padding: "6px 16px", borderRadius: 20,
        border: active ? "none" : "1.5px solid #E4E4E7",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        fontFamily: "inherit",
        cursor: "pointer", whiteSpace: "nowrap",
        boxShadow: active ? "0 2px 8px rgba(83,74,183,0.28)" : "none",
        transition: "all 0.15s",
      }}
      onMouseOver={e => {
        if (!active) {
          e.currentTarget.style.background = "#EEEDFE";
          e.currentTarget.style.borderColor = "#C5C0F5";
          e.currentTarget.style.color = "#26215C";
        }
      }}
      onMouseOut={e => {
        if (!active) {
          e.currentTarget.style.background = "#F4F3FF";
          e.currentTarget.style.borderColor = "#E4E4E7";
          e.currentTarget.style.color = "#52525B";
        }
      }}
    >
      {label}
    </button>
  );
}
