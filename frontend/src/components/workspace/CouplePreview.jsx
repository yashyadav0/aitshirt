import { useEffect, useRef, useState } from "react";

export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,
  productType,

  hisColor,
  herColor,

  hisSide,
  herSide,
  isLoading = false,
  onRendered,
  onRenderError

}) {

  const renderKey = [
    generatedHisImage,
    generatedHerImage,
    hisColor,
    herColor,
    hisSide,
    herSide,
    productType
  ].join("|");
  const [loaded, setLoaded] = useState({
    key: "",
    firstMockup: false,
    firstArtwork: false,
    secondMockup: false,
    secondArtwork: false
  });
  const reportedRenderKey = useRef("");
  const rendered = (
    loaded.key === renderKey
    && loaded.firstMockup
    && loaded.firstArtwork
    && loaded.secondMockup
    && loaded.secondArtwork
  );

  useEffect(() => {
    if (
      generatedHisImage
      && generatedHerImage
      && rendered
      && reportedRenderKey.current !== renderKey
    ) {
      reportedRenderKey.current = renderKey;
      onRendered?.();
    }
  }, [generatedHerImage, generatedHisImage, onRendered, renderKey, rendered]);

  const markLoaded = (part) => {
    setLoaded((current) => {
      const next = current.key === renderKey
        ? current
        : {
          key: renderKey,
          firstMockup: false,
          firstArtwork: false,
          secondMockup: false,
          secondArtwork: false
        };
      return { ...next, [part]: true };
    });
  };

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

          {isLoading && !generatedHisImage ? (
            <div className="h-full w-full animate-pulse bg-[#202020]" />
          ) : (
            <>
              <img
                src={
                  getMockup(
                    productType,
                    hisColor,
                    hisSide
                  )
                }
                alt="his mockup"
                className="w-full h-full object-cover"
                onLoad={() => markLoaded("firstMockup")}
                onError={() => onRenderError?.("The first product mockup could not be loaded.")}
              />

              <img
                src={generatedHisImage}
                alt="his design"
                onLoad={() => markLoaded("firstArtwork")}
                onError={() => onRenderError?.("The first generated design could not be rendered on the mockup.")}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{
                  top: currentStyle.top,
                  width: currentStyle.width,
                  maxHeight: currentStyle.maxHeight,
                  height: "auto"
                }}
              />
            </>
          )}

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

          {isLoading && !generatedHerImage ? (
            <div className="h-full w-full animate-pulse bg-[#202020]" />
          ) : (
            <>
              <img
                src={
                  getMockup(
                    productType,
                    herColor,
                    herSide
                  )
                }
                alt="her mockup"
                className="w-full h-full object-cover"
                onLoad={() => markLoaded("secondMockup")}
                onError={() => onRenderError?.("The second product mockup could not be loaded.")}
              />

              <img
                src={generatedHerImage}
                alt="her design"
                onLoad={() => markLoaded("secondArtwork")}
                onError={() => onRenderError?.("The second generated design could not be rendered on the mockup.")}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{
                  top: currentStyle.top,
                  width: currentStyle.width,
                  maxHeight: currentStyle.maxHeight,
                  height: "auto"
                }}
              />
            </>
          )}

        </div>

      </div>

    </div>
  );
}
