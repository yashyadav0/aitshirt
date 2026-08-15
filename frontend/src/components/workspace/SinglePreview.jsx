export default function SinglePreview({

  generatedImage,
  mockupRef,
  getMockup,

  productType,

  selectedColor,
  selectedSide,

  designScale = 45,
  designTilt = 0

}) {

  if (!generatedImage)
    return null;

  const designStyles = {

    tshirt: {

      frontTop: "28%",
      backTop: "30%",
      baseWidth: "48%"
    },

    hoodie: {

      frontTop: "42%",
      backTop: "44%",
      baseWidth: "27%"
    },

    oversized: {

      frontTop: "28%",
      backTop: "30%",
      baseWidth: "55%"
    },

    kids: {

      frontTop: "44%",
      backTop: "46%",
      baseWidth: "34%"
    }
  };

  const styleConfig = designStyles[productType] || designStyles.tshirt;
  const top = selectedSide === "front" ? styleConfig.frontTop : styleConfig.backTop;
  const scaledWidth = `${parseFloat(styleConfig.baseWidth) * (designScale / 45)}%`;

  return (

    <div
      className="
        mt-6
        sm:mt-10
      "
    >

      <div

        ref={mockupRef}

        className="
          relative
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          bg-[#171717]
          border
          border-[#2f2f2f]
        "
      >

        <img

          src={
            getMockup(
              productType,
              selectedColor,
              selectedSide
            )
          }

          alt="mockup"

          className="
            w-full
            block
          "
        />

        <img

          src={generatedImage}

          alt="design"

          style={{

            position:
              "absolute",

            top:
              top,

            left: "50%",

            transform:
              "translate(-50%, -50%) rotate(" + designTilt + "deg)",

            width:
              scaledWidth,

            objectFit:
              "contain",

            pointerEvents:
              "none"
          }}
        />

      </div>

    </div>
  );
}
