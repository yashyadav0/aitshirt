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

        placeholder="
Describe your matching couple design...

Example:
Dark fantasy anime couple with matching blue flame aura, oversized streetwear, split composition, emotional connection, premium cyberpunk aesthetic.
"

        value={couplePrompt}

        onChange={(e) =>
          setCouplePrompt(
            e.target.value
          )
        }

        className="
          w-full
          min-h-[220px]
          bg-[#18181b]
          border
          border-[#27272a]
          rounded-[28px]
          p-5
          text-white
          outline-none
          resize-none
        "
      />

    </div>
  );
}