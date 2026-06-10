export default function SinglePromptBox({

  prompt,
  setPrompt

}) {

  return (

    <textarea

      placeholder="Describe your dream design..."

      value={prompt}

      onChange={(e) =>
        setPrompt(
          e.target.value
        )
      }

      className="
        w-full
        min-h-[180px]
        bg-transparent
        outline-none
        resize-none
        text-white
        text-base
        leading-7
        placeholder:text-zinc-600
        md:text-lg
      "
    />
  );
}
