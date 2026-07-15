import { useEffect, useRef, useState } from "react";

export default function SinglePreview({

  generatedImage,
  mockupRef,
  getMockup,

  productType,

  selectedColor,
  selectedSide,
  isLoading = false,
  onRendered,
  onRenderError

}) {

  const renderKey = [
    generatedImage,
    productType,
    selectedColor,
    selectedSide
  ].join("|");
  const [loaded, setLoaded] = useState({
    key: "",
    mockup: false,
    artwork: false
  });
  const reportedRenderKey = useRef("");

  const rendered = loaded.key === renderKey && loaded.mockup && loaded.artwork;

  useEffect(() => {
    if (generatedImage && rendered && reportedRenderKey.current !== renderKey) {
      reportedRenderKey.current = renderKey;
      onRendered?.();
    }
  }, [generatedImage, onRendered, renderKey, rendered]);

  const markLoaded = (part) => {
    setLoaded((current) => {
      const next = current.key === renderKey
        ? current
        : { key: renderKey, mockup: false, artwork: false };
      return { ...next, [part]: true };
    });
  };

  if (!generatedImage && !isLoading)
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

        {isLoading && !generatedImage ? (
          <div className="aspect-square w-full animate-pulse bg-[#202020]" />
        ) : (
          <>
            <img
              src={
                getMockup(
                  productType,
                  selectedColor,
                  selectedSide
                )
              }
              alt="mockup"
              className="w-full block"
              onLoad={() => markLoaded("mockup")}
              onError={() => onRenderError?.("The product mockup could not be loaded.")}
            />

            <img
              src={generatedImage}
              alt="design"
              onLoad={() => markLoaded("artwork")}
              onError={() => onRenderError?.("The generated design could not be rendered on the mockup.")}
              style={{
                position: "absolute",
                top: currentStyle.top,
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: currentStyle.width,
                objectFit: "contain",
                pointerEvents: "none"
              }}
            />
          </>
        )}

      </div>

    </div>
  );
}
