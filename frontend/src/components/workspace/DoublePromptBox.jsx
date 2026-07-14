export default function DoublePromptBox({ frontPrompt, setFrontPrompt, backPrompt, setBackPrompt }) {
  const inputClass = "w-full min-h-28 bg-[#101010] rounded-xl border border-[#2f2f2f] p-4 outline-none resize-y text-white text-base leading-7 placeholder:text-zinc-600 focus:border-cyan-500/60";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-zinc-200">
        Front Design Prompt
        <textarea className={inputClass} value={frontPrompt} onChange={(event) => setFrontPrompt(event.target.value)} placeholder="Minimal Japanese dragon wrapping around a red sun." />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-200">
        Back Design Prompt
        <textarea className={inputClass} value={backPrompt} onChange={(event) => setBackPrompt(event.target.value)} placeholder="Large detailed dragon with clouds and flames covering most of the back." />
      </label>
    </div>
  );
}
