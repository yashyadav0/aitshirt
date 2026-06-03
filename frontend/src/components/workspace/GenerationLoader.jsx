export default function GenerationLoader({
  generationStep
}) {

  if (!generationStep)
    return null;

  return (

    <div
      className="
        text-center
        mt-8
        text-cyan-400
        text-xl
        font-bold
      "
    >

      {generationStep}

    </div>
  );
}