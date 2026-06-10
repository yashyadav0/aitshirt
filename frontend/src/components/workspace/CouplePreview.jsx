export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,
  productType,

  hisColor,
  herColor,

  hisSide,
  herSide

}) {

  const designStyles = {

    tshirt: {

      top: "42%",
      width: "48%"
    },

    hoodie: {

      top: "43%",
      width: "55%"
    }
  };

  const currentStyle =
    designStyles[
      productType
    ] || designStyles.tshirt;

  return (

    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-3
        mt-8
      "
    >

      {/* HIS */}

      <div
        className="
          bg-[#171717]
          rounded-2xl
          overflow-hidden
          border
          border-[#2f2f2f]
          p-3
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
                productType,
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
              -translate-x-1/2
              -translate-y-1/2
              object-contain
            "

            style={{

              top:
                currentStyle.top,

              width:
                currentStyle.width
            }}
          />

        </div>

      </div>


      {/* HER */}

      <div
        className="
          bg-[#171717]
          rounded-2xl
          overflow-hidden
          border
          border-[#2f2f2f]
          p-3
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
                productType,
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
              -translate-x-1/2
              -translate-y-1/2
              object-contain
            "

            style={{

              top:
                currentStyle.top,

              width:
                currentStyle.width
            }}
          />

        </div>

      </div>

    </div>
  );
}
