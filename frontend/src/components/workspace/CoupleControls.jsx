import { getColorsForProductType } from "../../config/designPreferences";

export default function CoupleControls({

  hisColor,
  setHisColor,

  herColor,
  setHerColor,

  productType,

  hisSide,
  setHisSide,

  herSide,
  setHerSide

}) {

  const colors = getColorsForProductType(productType);


  return (

    <div
      className="
        flex
        flex-col
        gap-3
        mt-6
      "
    >

      {/* HIS */}

      <div
        className="
          bg-[#171717]
          rounded-2xl
          p-4
          border
          border-[#2f2f2f]
        "
      >

        <div
          className="
            text-sm
            font-medium
            text-zinc-200
            mb-3
          "
        >

          His {productType === "hoodie" ? "Hoodie" : "T-Shirt"}

        </div>


        <div
          className="
            flex
            gap-3
            mb-3
          "
        >

          {

            colors.map((color) => (

              <button

                key={color}

            onClick={() =>
                  setHisColor(color.id)
                }

                className={`
                  w-12
                  h-12
                  rounded-full
                  border
                  border-[#3f3f46]
                  transition-all

                  ${
                    hisColor === color.id

                      ? "ring-2 ring-white scale-105"

                      : ""
                  }
                `}

                style={{
                  backgroundColor:
                    color.hex
                }}
              />

            ))
          }

        </div>

        <button
          onClick={() =>
            setHisSide(
              hisSide === "front"
                ? "back"
                : "front"
            )
          }
          className="
            min-h-12
            w-full
            rounded-2xl
            bg-[#202020]
            text-sm
            font-medium
            text-zinc-200
            transition
            hover:bg-[#2a2a2a]
          "
        >
          {hisSide === "front" ? "Front" : "Back"}
        </button>

      </div>


      {/* HER */}

      <div
        className="
          bg-[#171717]
          rounded-2xl
          p-4
          border
          border-[#2f2f2f]
        "
      >

        <div
          className="
            text-sm
            font-medium
            text-zinc-200
            mb-3
          "
        >

          Her {productType === "hoodie" ? "Hoodie" : "T-Shirt"}

        </div>


        <div
          className="
            flex
            gap-3
            mb-3
          "
        >

          {

            colors.map((color) => (

              <button

                key={color}

            onClick={() =>
                  setHerColor(color.id)
                }

                className={`
                  w-12
                  h-12
                  rounded-full
                  border
                  border-[#3f3f46]
                  transition-all

                  ${
                    herColor === color.id

                      ? "ring-2 ring-white scale-105"

                      : ""
                  }
                `}

                style={{
                  backgroundColor:
                    color.hex
                }}
              />

            ))
          }

        </div>

        <button
          onClick={() =>
            setHerSide(
              herSide === "front"
                ? "back"
                : "front"
            )
          }
          className="
            min-h-12
            w-full
            rounded-2xl
            bg-[#202020]
            text-sm
            font-medium
            text-zinc-200
            transition
            hover:bg-[#2a2a2a]
          "
        >
          {herSide === "front" ? "Front" : "Back"}
        </button>

      </div>

    </div>
  );
}
