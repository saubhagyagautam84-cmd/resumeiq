import { IconUser } from "@tabler/icons-react";

const FIELDS = [
  { key: "name",     label: "Full name",        placeholder: "e.g. Priya Shah",               span: 2 },
  { key: "email",    label: "Email",             placeholder: "priya@example.com" },
  { key: "phone",    label: "Phone",             placeholder: "+1 (555) 000-0000" },
  { key: "location", label: "Location",          placeholder: "City, State / Remote" },
  { key: "linkedin", label: "LinkedIn URL",      placeholder: "linkedin.com/in/yourname" },
  { key: "github",   label: "GitHub URL",        placeholder: "github.com/yourname" },
];

export default function Contact({ data, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#EEEDFE",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconUser size={18} color="#7F77DD" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#26215C", fontSize: 15 }}>Contact information</div>
          <div style={{ fontSize: 12, color: "#5F5E5A" }}>These appear at the top of your resume.</div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
      }}>
        {FIELDS.map(({ key, label, placeholder, span }) => (
          <div key={key} style={span === 2 ? { gridColumn: "1 / -1" } : {}}>
            <label className="riq-label">{label}</label>
            <input
              className="riq-input"
              placeholder={placeholder}
              value={data[key] ?? ""}
              onChange={e => onChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
