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
          py-4
          rounded-2xl
          text-lg
          font-bold
          transition-all

          ${
            generationMode === "single"

            ? "bg-white text-black"

            : "bg-[#18181b] text-white"
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
          py-4
          rounded-2xl
          text-lg
          font-bold
          transition-all

          ${
            generationMode === "couple"

            ? "bg-pink-500 text-white"

            : "bg-[#18181b] text-white"
          }

        `}
      >

        Couple Design

      </button>

    </div>
  );
}