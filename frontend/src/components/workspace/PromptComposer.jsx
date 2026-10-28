import { useEffect, useRef } from "react";
import { Plus, Mic, ArrowUp, X, LoaderCircle } from "lucide-react";

// Pill composer: + (reference upload), text, mic, send
export default function PromptComposer({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder = "Ask anything",
  referenceImages,
  setReferenceImages,
  isListening,
  onMic,
  inputRef
}) {
  const fileRef = useRef(null);
  const localRef = useRef(null);
  const ta = inputRef || localRef;

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value, ta]);

  const canSend = !loading && value.trim().length > 0;

  return (
    <div className="rounded-[28px] border border-[#2f2f2f] bg-[#171717] p-2 shadow-2xl shadow-black/30">
      {referenceImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-2 pb-2 pt-1">
          {referenceImages.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative shrink-0">
              <img
                src={URL.createObjectURL(file)}
                alt="reference"
                className="h-16 w-16 rounded-xl border border-[#2f2f2f] object-cover"
              />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() =>
                  setReferenceImages(referenceImages.filter((_, j) => j !== i))
                }
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white ring-1 ring-[#3f3f46]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            setReferenceImages([
              ...referenceImages,
              ...Array.from(e.target.files || [])
            ]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          aria-label="Upload reference image"
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-300 transition hover:bg-[#242424] hover:text-white"
        >
          <Plus size={22} />
        </button>

        <textarea
          ref={ta}
          rows={1}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
          className="max-h-40 min-h-11 flex-1 resize-none self-center bg-transparent px-2 py-2.5 text-base text-white outline-none placeholder:text-zinc-500"
        />

        <button
          type="button"
          aria-label="Voice input"
          onClick={onMic}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
            isListening
              ? "bg-red-500 text-white"
              : "text-zinc-300 hover:bg-[#242424] hover:text-white"
          }`}
        >
          <Mic size={20} />
        </button>

        <button
          type="button"
          aria-label="Generate design"
          disabled={!canSend}
          onClick={onSubmit}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-zinc-500"
        >
          {loading ? (
            <LoaderCircle size={20} className="animate-spin" />
          ) : (
            <ArrowUp size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
