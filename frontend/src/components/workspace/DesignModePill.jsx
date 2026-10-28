import { useEffect, useRef, useState } from "react";
import { ChevronDown, Shirt, WandSparkles } from "lucide-react";

import { PRODUCT_TYPES, DESIGN_TYPES } from "../../config/designPreferences";

const MODE_LABELS = {
  single: "Single Design (Front)",
  double: "Double Side (Front + Back)",
  couple: "Couple Design"
};

function Row({ icon: Icon, label, value, onChange, children }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#202020] text-zinc-200">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-zinc-500">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-base text-white outline-none"
        >
          {children}
        </select>
      </span>
      <ChevronDown size={18} className="text-zinc-400" />
    </label>
  );
}

// "Design ⌄" pill with Product + Generation Mode dropdowns (Gemini-style)
export default function DesignModePill({
  preferences,
  setProductType,
  setDesignType,
  onDesignTypeChange,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  const isKids = (preferences.productType || "").toLowerCase() === "kids";
  const modes = Object.values(DESIGN_TYPES).filter(
    (d) => !isKids || d.id === "single"
  );

  return (
    <div ref={ref} className="relative mx-auto w-fit">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1c1c1c] px-5 text-base font-medium text-white transition hover:bg-[#262626] disabled:opacity-60"
      >
        Design
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-[min(92vw,360px)] -translate-x-1/2 divide-y divide-[#2f2f2f] rounded-3xl border border-[#2f2f2f] bg-[#171717] shadow-2xl shadow-black/50">
          <Row
            icon={Shirt}
            label="Product"
            value={preferences.productType}
            onChange={setProductType}
          >
            {Object.values(PRODUCT_TYPES).map((p) => (
              <option key={p.id} value={p.id} className="bg-[#171717]">
                {p.label}
              </option>
            ))}
          </Row>
          <Row
            icon={WandSparkles}
            label="Generation Mode"
            value={preferences.designType}
            onChange={(v) => {
              setDesignType(v);
              onDesignTypeChange?.(v);
            }}
          >
            {modes.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#171717]">
                {MODE_LABELS[m.id] || m.label}
              </option>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
