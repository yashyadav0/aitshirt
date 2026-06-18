export default function SingleControls({

  selectedColor,
  setSelectedColor,

  selectedSide,
  setSelectedSide,

  productType

}) {

  const colors =

    productType === "hoodie"

      ? ["black", "white", "blue"]

      : ["black", "white", "red"];

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

              onClick={() =>
                setSelectedColor(
                  color
                )
              }

              className={`
                w-10
                sm:w-12
                h-10
                sm:h-12
                rounded-full
                border
                border-[#3f3f46]
                transition-all
                flex-shrink-0

                ${
                  selectedColor === color

                    ? "ring-2 ring-white scale-105"

                    : ""
                }
              `}

              style={{
                backgroundColor:
                  color
              }}
              aria-label={`Select ${color}`}
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
          min-h-10
          sm:min-h-12
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
