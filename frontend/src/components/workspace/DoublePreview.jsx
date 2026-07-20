import { useEffect, useState } from "react";

export default function DoublePreview({
  frontImage,
  backImage,
  getMockup,
  productType,
  color,
  frontSide = "front",
  backSide = "back",
  isLoading = false,
}) {
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    setFailedImages({});
  }, [frontImage, backImage]);

  const printArea =
    productType === "hoodie"
      ? {
          left: "18%",
          top: "25%",
          width: "64%",
          height: "58%",
        }
      : {
          left: "14%",
          top: "23%",
          width: "72%",
          height: "62%",
        };

  const renderCard = (label, side, image) => (
    <section className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
      <p className="mb-3 text-center text-sm font-medium text-zinc-300">
        {label} Print
      </p>

      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#111]">

        {isLoading && !image ? (
          <div className="flex h-full w-full items-center justify-center animate-pulse bg-[#202020] text-zinc-500">
            Generating...
          </div>
        ) : (
          <>
            {/* Mockup */}
            <img
              src={getMockup(productType, color, side)}
              alt={`${label} mockup`}
              className="absolute inset-0 h-full w-full object-contain select-none"
              draggable={false}
            />

            {/* Artwork */}
            {image && !failedImages[label] && (
              <div
                className="absolute flex items-center justify-center overflow-hidden"
                style={printArea}
              >
                <img
                  src={image}
                  alt={`${label} artwork`}
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                  onLoad={() =>
                    console.log(`${label} artwork loaded successfully`)
                  }
                  onError={() => setFailedImages((current) => ({ ...current, [label]: true }))}
                />
              </div>
            )}
            {failedImages[label] && (
              <p className="absolute inset-x-4 bottom-4 rounded-lg bg-red-950/80 px-3 py-2 text-center text-xs text-red-200">
                {label} artwork could not be displayed. Please regenerate.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {renderCard("Front", frontSide, frontImage)}
      {renderCard("Back", backSide, backImage)}
    </div>
  );
}
