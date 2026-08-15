export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,
  productType,

  hisColor,
  herColor,

  hisSide,
  herSide,

  designScale = 45

}) {

  const designStyles = {

    tshirt: {

      top: "42%",
      baseWidth: "48%"
    },

    hoodie: {

      top: "43%",
      baseWidth: "55%"
    },

    oversized: {

      top: "42%",
      baseWidth: "55%"
    },

    kids: {

      top: "40%",
      baseWidth: "34%"
    }
  };

  const styleConfig = designStyles[productType] || designStyles.tshirt;
  const scaledWidth = `${parseFloat(styleConfig.baseWidth) * (designScale / 45)}%`;

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
                styleConfig.top,

              width:
                scaledWidth
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
                styleConfig.top,

              width:
                scaledWidth
            }}
          />

        </div>

      </div>

    </div>
  );
}
