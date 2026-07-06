const COLORS = [
  { bg: "#EEEDFE", text: "#26215C" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#FAEEDA", text: "#633806" },
];

function hashIdx(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % COLORS.length;
}

export default function Avatar({ name = "?", size = 36 }) {
  const initials = (name.trim() || "?")
    .split(/\s+/)
    .map(w => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const { bg, text } = COLORS[hashIdx(name)];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.36), fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
