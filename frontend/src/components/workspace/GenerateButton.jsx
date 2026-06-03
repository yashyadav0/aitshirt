export default function GenerateButton({
  loading,
  handleGenerate
}) {

  return (

    <button

      onClick={
        handleGenerate
      }

      disabled={loading}

      className="
        w-full
        mt-8
        py-5
        rounded-full
        bg-white
        text-black
        text-3xl
        font-bold
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