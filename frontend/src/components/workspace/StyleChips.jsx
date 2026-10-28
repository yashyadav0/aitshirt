import { STYLE_CHIPS } from "../../config/styleChips";

export default function StyleChips({ selected, onToggle, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {STYLE_CHIPS.map(({ id, label, icon: Icon }) => {
        const active = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onToggle(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition disabled:opacity-50 ${
              active
                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200"
                : "border-[#2f2f2f] bg-[#121212] text-zinc-300 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
