export default function GenerationModeToggle({

  generationMode,

  setGenerationMode

}) {

  return (

    <div
      className="
        flex
        gap-3
        mb-5
        rounded-2xl
        bg-[#171717]
        border
        border-[#2f2f2f]
        p-1
      "
    >

      <button

        onClick={() =>
          setGenerationMode(
            "single"
          )
        }

        className={`

          flex-1
          py-3
          rounded-xl
          text-sm
          font-medium
          transition-all

          ${
            generationMode === "single"

            ? "bg-[#2f2f2f] text-white"

            : "text-zinc-400 hover:text-white"
          }

        `}
      >

        Single Design

      </button>


      <button

        onClick={() =>
          setGenerationMode(
            "couple"
          )
        }

        className={`

          flex-1
          py-3
          rounded-xl
          text-sm
          font-medium
          transition-all

          ${
            generationMode === "couple"

            ? "bg-[#2f2f2f] text-white"

            : "text-zinc-400 hover:text-white"
          }

        `}
      >

        Couple Design

      </button>

    </div>
  );
}
