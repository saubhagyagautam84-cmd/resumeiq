/**
 * Template gallery — shown before the form so users pick a style first.
 * All templates are ATS-safe (single column, no graphics).
 */
const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    desc: "Traditional, clean, works everywhere",
    preview: (
      <div className="p-3 bg-white text-[6px] leading-tight font-serif">
        <div className="text-center border-b border-gray-800 pb-1 mb-1">
          <div className="text-[9px] font-bold tracking-wide">JOHN DOE</div>
          <div className="text-gray-500">john@email.com · (555) 000-0000 · New York, NY</div>
        </div>
        <div className="font-bold uppercase border-b border-gray-800 mb-0.5 text-[7px]">Experience</div>
        <div className="font-semibold">Software Engineer — Google</div>
        <div className="text-gray-500">2020 – Present</div>
        <div className="mt-0.5 text-gray-700">• Led team of 5 engineers building ML pipelines</div>
        <div className="font-bold uppercase border-b border-gray-800 mb-0.5 mt-1 text-[7px]">Education</div>
        <div className="font-semibold">B.S. Computer Science — MIT</div>
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Blue accents, contemporary feel",
    preview: (
      <div className="p-3 bg-white text-[6px] leading-tight">
        <div className="border-l-4 border-blue-600 pl-2 mb-1">
          <div className="text-[9px] font-bold text-blue-700">John Doe</div>
          <div className="text-gray-500">john@email.com · (555) 000-0000</div>
        </div>
        <div className="text-blue-600 font-bold uppercase text-[7px] mb-0.5 tracking-wider">Experience</div>
        <div className="font-semibold">Software Engineer</div>
        <div className="text-blue-500 text-[5px]">Google · 2020 – Present</div>
        <div className="mt-0.5 text-gray-700">• Led team of 5 engineers building ML pipelines</div>
        <div className="text-blue-600 font-bold uppercase text-[7px] mt-1 mb-0.5 tracking-wider">Education</div>
        <div className="font-semibold">B.S. Computer Science — MIT</div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean whitespace, modern minimal",
    preview: (
      <div className="p-3 bg-white text-[6px] leading-tight">
        <div className="mb-1.5">
          <div className="text-[9px] font-light tracking-[0.2em] uppercase">John Doe</div>
          <div className="text-gray-400 text-[5px] tracking-widest">john@email.com · (555) 000-0000</div>
        </div>
        <div className="text-gray-400 uppercase text-[5px] tracking-[0.15em] mb-0.5">──── Experience</div>
        <div className="font-medium">Software Engineer</div>
        <div className="text-gray-400">Google · 2020 – Present</div>
        <div className="mt-0.5 text-gray-600">• Led team of 5 engineers building ML pipelines</div>
        <div className="text-gray-400 uppercase text-[5px] tracking-[0.15em] mt-1 mb-0.5">──── Education</div>
        <div className="font-medium">B.S. Computer Science — MIT</div>
      </div>
    ),
  },
];

export { TEMPLATES };

export default function TemplateGallery({ selected, onSelect, onContinue }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
        <p className="text-gray-500 mt-1 text-sm">Pick a style first — you can change it any time.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`group text-left rounded-xl border-2 overflow-hidden transition-all ${
              selected === t.id
                ? "border-blue-500 shadow-lg shadow-blue-100"
                : "border-gray-200 hover:border-blue-300 hover:shadow-md"
            }`}
          >
            {/* Mini preview */}
            <div className="h-40 bg-gray-50 border-b border-gray-100 overflow-hidden relative">
              <div className="scale-[1.8] origin-top-left absolute top-0 left-0 w-[56%]">
                {t.preview}
              </div>
              {selected === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              )}
            </div>
            <div className="p-3">
              <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button className="btn-primary px-8 py-2.5" onClick={onContinue}>
          Continue with {TEMPLATES.find((t) => t.id === selected)?.name} →
        </button>
      </div>
    </div>
  );
}
