export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,
  productType,

  hisColor,
  herColor,

  hisSide,
  herSide,

  designScale = 45,
  designTilt = 0

}) {

  const designStyles = {

    tshirt: {

      frontTop: "28%",
      backTop: "30%",
      baseWidth: "48%"
    },

    hoodie: {

      frontTop: "43%",
      backTop: "45%",
      baseWidth: "55%"
    },

    oversized: {

      frontTop: "28%",
      backTop: "30%",
      baseWidth: "55%"
    },

    kids: {

      frontTop: "40%",
      backTop: "42%",
      baseWidth: "34%"
    }
  };

  const styleConfig = designStyles[productType] || designStyles.tshirt;
  const hisTop = hisSide === "front" ? styleConfig.frontTop : styleConfig.backTop;
  const herTop = herSide === "front" ? styleConfig.frontTop : styleConfig.backTop;
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
                hisTop,

              width:
                scaledWidth,
              transform: `rotate(${designTilt}deg)`
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
                herTop,

              width:
                scaledWidth,
              transform: `rotate(${designTilt}deg)`
            }}
          />

        </div>

      </div>

    </div>
  );
}
