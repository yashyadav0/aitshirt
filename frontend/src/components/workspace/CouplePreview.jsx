export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,

  hisColor,
  herColor,

  hisSide,
  herSide,

  hisScale,
  herScale
}) {

  return (

    <div
      className="
        grid
        grid-cols-2
        gap-4
        mt-8
      "
    >

      {/* HIS */}

      <div
        className="
          bg-[#18181b]
          rounded-[32px]
          overflow-hidden
          border
          border-[#27272a]
          p-4
        "
      >

        <div
          className="
            relative
            aspect-square
          "
        >

          <img

            src={
              getMockup(
                hisColor,
                hisSide
              )
            }

            alt="his mockup"

            className="
              w-full
              h-full
              object-cover
            "
          />


          <img

            src={
              generatedHisImage
            }

            alt="his design"

            className="
              absolute
              left-1/2
              top-[38%]
              -translate-x-1/2
              -translate-y-1/2
              object-contain
            "

            style={{

              width:
                `${hisScale}%`
            }}
          />

        </div>

      </div>


      {/* HER */}

      <div
        className="
          bg-[#18181b]
          rounded-[32px]
          overflow-hidden
          border
          border-[#27272a]
          p-4
        "
      >

        <div
          className="
            relative
            aspect-square
          "
        >

          <img

            src={
              getMockup(
                herColor,
                herSide
              )
            }

            alt="her mockup"

            className="
              w-full
              h-full
              object-cover
            "
          />


          <img

            src={
              generatedHerImage
            }

            alt="her design"

            className="
              absolute
              left-1/2
              top-[38%]
              -translate-x-1/2
              -translate-y-1/2
              object-contain
            "

            style={{

              width:
                `${herScale}%`
            }}
          />

        </div>

      </div>

    </div>
  );
}