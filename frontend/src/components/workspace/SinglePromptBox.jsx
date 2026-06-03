export default function SinglePromptBox({

  prompt,
  setPrompt

}) {

  return (

    <textarea

      placeholder="
Describe your dream design...
"

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
        text-[20px]
      "
    />
  );
}