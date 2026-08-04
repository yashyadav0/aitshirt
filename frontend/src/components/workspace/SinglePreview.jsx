export default function SinglePreview({

  generatedImage,
  mockupRef,
  getMockup,

  productType,

  selectedColor,
  selectedSide

}) {

  if (!generatedImage)
    return null;

  const designStyles = {

    tshirt: {

      top: "50%",

      width: "48%"
    },

    hoodie: {

      top: "42%",

      width: "27%"
    }
  };

  const currentStyle =
    designStyles[
      productType
    ] || designStyles.tshirt;

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
              currentStyle.top,

            left: "50%",

            transform:
              "translate(-50%, -50%)",

            width:
              currentStyle.width,

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
