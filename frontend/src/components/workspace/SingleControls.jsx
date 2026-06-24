import { getColorsForProductType } from "../../config/designPreferences";

export default function SingleControls({

  selectedColor,
  setSelectedColor,
  setPreferenceColor,

  selectedSide,
  setSelectedSide,

  productType

}) {

  const colors = getColorsForProductType(productType);

  return (

    <div
      className="
        mt-4
        sm:mt-5
        bg-[#171717]
        rounded-xl
        sm:rounded-2xl
        p-3
        sm:p-4
        border
        border-[#2f2f2f]
      "
    >

      {/* COLOR PICKER */}

      <div
        className="
          flex
          justify-center
          gap-2
          sm:gap-3
          mb-2
          sm:mb-3
          flex-wrap
        "
      >

        {

          colors.map((color) => (

            <button

              key={color}

            onClick={() => {
                setSelectedColor(color.id);
                setPreferenceColor?.(color.id);
              }}

              className={`
                min-w-11
                min-h-11
                sm:w-12
                sm:h-12
                rounded-full
                border
                border-[#3f3f46]
                transition-all
                flex-shrink-0

                ${
                selectedColor === color.id

                    ? "ring-2 ring-white scale-105"

                    : ""
                }
              `}

              style={{
                backgroundColor:
                  color.hex
              }}
              aria-label={`Select ${color.label}`}
            />

          ))
        }

      </div>


      {/* FRONT / BACK */}

      <button

        onClick={() =>

          setSelectedSide(

            selectedSide === "front"

              ? "back"

              : "front"
          )
        }

        className="
          w-full
          min-h-12
          rounded-xl
          sm:rounded-2xl
          bg-[#202020]
          text-xs
          sm:text-sm
          font-medium
          text-zinc-200
          transition
          hover:bg-[#2a2a2a]
        "
      >

        {selectedSide === "front" ? "Front" : "Back"}

      </button>

    </div>
  );
}
