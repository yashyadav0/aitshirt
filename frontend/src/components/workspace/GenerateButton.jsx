export default function GenerateButton({
  loading,
  handleGenerate
}) {

  return (

    <button

      type="button"

      onClick={
        handleGenerate
      }

      disabled={loading}

      aria-busy={loading}

      className="
        min-h-12
        flex-1
        rounded-2xl
        bg-cyan-400
        px-5
        text-sm
        font-semibold
        text-black
        transition
        hover:bg-cyan-300
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >

      {
        loading
          ? "Generating..."
          : "Generate Design"
      }

    </button>
  );
}
