import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Shirt, WandSparkles } from "lucide-react";

import { PRODUCT_TYPES, DESIGN_TYPES } from "../../config/designPreferences";

const MODE_LABELS = {
  single: "Single Design (Front)",
  double: "Double Side (Front + Back)",
  couple: "Couple Design"
};

function CustomDropdown({ icon: Icon, label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#202020]/50"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#202020] text-zinc-200">
          <Icon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-zinc-500">{label}</span>
          <span className="block truncate text-base font-medium text-white">
            {selectedOption ? selectedOption.label : "Select..."}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-[#2f2f2f] bg-[#1a1a1a] p-1.5 shadow-xl">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                  isSelected
                    ? "bg-[#262626] font-medium text-white"
                    : "text-zinc-300 hover:bg-[#222222] hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} className="text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// "Design ⌄" pill with Product + Generation Mode custom dropdowns
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
  
  // Format product types for the custom dropdown
  const productOptions = Object.values(PRODUCT_TYPES).map((p) => ({
    id: p.id,
    label: p.label
  }));

  // Format design/generation modes for the custom dropdown
  const modeOptions = Object.values(DESIGN_TYPES)
    .filter((d) => !isKids || d.id === "single")
    .map((m) => ({
      id: m.id,
      label: MODE_LABELS[m.id] || m.label
    }));

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
          <CustomDropdown
            icon={Shirt}
            label="Product"
            value={preferences.productType}
            options={productOptions}
            onChange={setProductType}
          />
          <CustomDropdown
            icon={WandSparkles}
            label="Generation Mode"
            value={preferences.designType}
            options={modeOptions}
            onChange={(v) => {
              setDesignType(v);
              onDesignTypeChange?.(v);
            }}
          />
        </div>
      )}
    </div>
  );
}