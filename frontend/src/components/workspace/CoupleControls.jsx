export default function CoupleControls({

  hisColor,
  setHisColor,

  herColor,
  setHerColor,

  hisScale,
  setHisScale,

  herScale,
  setHerScale
}) {

  const colors = [

    "white",
    "black",
    "red"
  ];


  return (

    <div
      className="
        flex
        flex-col
        gap-6
        mt-6
      "
    >

      {/* HIS */}

      <div
        className="
          bg-[#18181b]
          rounded-[28px]
          p-5
        "
      >

        <div
          className="
            text-xl
            font-bold
            mb-4
          "
        >

          His Shirt

        </div>


        <div
          className="
            flex
            gap-3
            mb-4
          "
        >

          {
            colors.map(
              (color) => (

                <button

                  key={color}

                  onClick={() =>
                    setHisColor(
                      color
                    )
                  }

                  className="
                    flex-1
                    py-3
                    rounded-full
                    border
                  "
                >

                  {color}

                </button>
              )
            )
          }

        </div>


        <input

          type="range"

          min="30"

          max="60"

          value={hisScale}

          onChange={(e) =>
            setHisScale(
              e.target.value
            )
          }

          className="
            w-full
          "
        />

      </div>


      {/* HER */}

      <div
        className="
          bg-[#18181b]
          rounded-[28px]
          p-5
        "
      >

        <div
          className="
            text-xl
            font-bold
            mb-4
          "
        >

          Her Shirt

        </div>


        <div
          className="
            flex
            gap-3
            mb-4
          "
        >

          {
            colors.map(
              (color) => (

                <button

                  key={color}

                  onClick={() =>
                    setHerColor(
                      color
                    )
                  }

                  className="
                    flex-1
                    py-3
                    rounded-full
                    border
                  "
                >

                  {color}

                </button>
              )
            )
          }

        </div>


        <input

          type="range"

          min="30"

          max="60"

          value={herScale}

          onChange={(e) =>
            setHerScale(
              e.target.value
            )
          }

          className="
            w-full
          "
        />

      </div>

    </div>
  );
}