export default function CoupleInputs({

  couplePrompt,

  setCouplePrompt

}) {

  return (

    <div
      className="
        flex
        flex-col
        gap-4
      "
    >

      <textarea

        placeholder="Describe your matching couple design..."

        value={couplePrompt}

        onChange={(e) =>
          setCouplePrompt(
            e.target.value
          )
        }

        className="
          w-full
          min-h-[180px]
          bg-transparent
          text-white
          outline-none
          resize-none
          text-base
          leading-7
          placeholder:text-zinc-600
          md:text-lg
        "
      />

    </div>
  );
}
