export default function SinglePreview({

  generatedImage,
  mockupRef,
  getMockup,

  productType,

  selectedColor,
  selectedSide,

  designScale = 45

}) {

  if (!generatedImage)
    return null;

  const designStyles = {

    tshirt: {

      top: "50%",

      baseWidth: "48%"
    },

    hoodie: {

      top: "42%",

      baseWidth: "27%"
    },

    oversized: {

      top: "42%",

      baseWidth: "55%"
    },

    kids: {

      top: "44%",

      baseWidth: "34%"
    }
  };

  const styleConfig = designStyles[productType] || designStyles.tshirt;
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
              styleConfig.top,

            left: "50%",

            transform:
              "translate(-50%, -50%)",

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
