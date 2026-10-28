import { Pencil, RefreshCw, ArrowLeft } from "lucide-react";

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2f2f2f] bg-[#171717] text-zinc-200 transition hover:border-cyan-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

// Compact action row under the generated preview
export default function ResultToolbar({ onRefine, onRegenerate, onStartOver, loading }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        {onRefine && (
          <IconButton label="Refine this design" onClick={onRefine} disabled={loading}>
            <Pencil size={18} />
          </IconButton>
        )}
        <IconButton label="Regenerate" onClick={onRegenerate} disabled={loading}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </IconButton>
      </div>
      <button
        type="button"
        onClick={onStartOver}
        disabled={loading}
        className="inline-flex min-h-11 items-center gap-1.5 px-3 text-sm text-zinc-500 transition hover:text-white disabled:opacity-50"
      >
        <ArrowLeft size={14} />
        Start over
      </button>
    </div>
  );
}
