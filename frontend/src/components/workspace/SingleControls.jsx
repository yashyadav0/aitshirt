export default function SingleControls({

  selectedColor,
  setSelectedColor,

  selectedSide,
  setSelectedSide

}) {

  return (

    <div
      className="
        mt-5
        bg-[#18181b]
        rounded-[24px]
        p-5
        border
        border-[#27272a]
      "
    >

      <div
        className="
          flex
          gap-2
          mb-5
        "
      >

        {
          ["black", "white", "red"]
          .map((color) => (

            <button

              key={color}

              onClick={() =>
                setSelectedColor(
                  color
                )
              }

              className={`
                flex-1
                py-3
                rounded-full
                text-sm
                font-bold
                border

                ${
                  selectedColor === color

                  ? "bg-white text-black border-white"

                  : "bg-transparent text-white border-[#3f3f46]"
                }
              `}
            >

              {color}

            </button>
          ))
        }

      </div>


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
          py-4
          rounded-full
          bg-cyan-500
          font-bold
          mb-5
        "
      >

        {selectedSide}

      </button>


      

    </div>
  );
}