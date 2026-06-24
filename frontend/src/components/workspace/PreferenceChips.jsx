import { RefreshCw } from "lucide-react";

import { getPreferenceLabels } from "../../config/designPreferences";

export default function PreferenceChips({
  preferences,
  onRegenerate,
  loading
}) {
  if (!preferences) {
    return null;
  }

  const labels = getPreferenceLabels(preferences);

  const chips = [
    labels.productType,
    labels.designType,
    labels.color
  ];

  return (
    <div
      className="
        mb-4
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >
        {chips.map((label) => (
          <span
            key={label}
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-[#2f2f2f]
              bg-[#171717]
              px-3
              py-1.5
              text-xs
              font-medium
              text-zinc-300
              transition-colors
              hover:border-cyan-500/40
            "
          >
            {label}
          </span>
        ))}
      </div>

      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            self-start
            rounded-xl
            border
            border-[#2f2f2f]
            bg-[#171717]
            px-4
            py-2
            text-sm
            font-medium
            text-zinc-200
            transition-all
            hover:border-cyan-500/50
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Regenerate
        </button>
      )}
    </div>
  );
}
