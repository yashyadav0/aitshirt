import { useEffect, useRef, useState } from "react";

export default function DoubleSidePreview({
  frontImage,
  backImage,
  getMockup,
  productType,
  selectedColor,
  isLoading = false,
  onRendered,
  onRenderError,
  designScale = 45
}) {
  const renderKey = [frontImage, backImage, productType, selectedColor].join("|");
  const [loaded, setLoaded] = useState({ key: "", frontMockup: false, frontArtwork: false, backMockup: false, backArtwork: false });
  const reportedKey = useRef("");
  const rendered = loaded.key === renderKey && loaded.frontMockup && loaded.frontArtwork && loaded.backMockup && loaded.backArtwork;

  useEffect(() => {
    if (frontImage && backImage && rendered && reportedKey.current !== renderKey) {
      reportedKey.current = renderKey;
      onRendered?.();
    }
  }, [backImage, frontImage, onRendered, renderKey, rendered]);

  const markLoaded = (part) => setLoaded((current) => {
    const next = current.key === renderKey
      ? current
      : { key: renderKey, frontMockup: false, frontArtwork: false, backMockup: false, backArtwork: false };
    return { ...next, [part]: true };
  });

  if (!frontImage || !backImage) {
    return isLoading ? <div className="mt-8 aspect-square animate-pulse rounded-2xl bg-[#202020]" /> : null;
  }

  const baseStyles = productType === "hoodie"
    ? { top: "42%", baseWidth: "52%" }
    : productType === "kids"
    ? { top: "42%", baseWidth: "40%" }
    : { top: "42%", baseWidth: "55%" };
  const artworkStyle = {
    ...baseStyles,
    width: `${parseFloat(baseStyles.baseWidth) * (designScale / 45)}%`
  };
  const sides = [
    { key: "front", label: "Front", image: frontImage },
    { key: "back", label: "Back", image: backImage }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sides.map(({ key, label, image }) => (
        <div key={key} className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
          <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
          <div className="relative aspect-square">
            <img src={getMockup(productType, selectedColor, key)} alt={`${label} mockup`} className="h-full w-full object-cover" onLoad={() => markLoaded(`${key}Mockup`)} onError={() => onRenderError?.(`The ${label.toLowerCase()} product mockup could not be loaded.`)} />
            <img src={image} alt={`${label} design`} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain" style={{ ...artworkStyle, left: "50%" }} onLoad={() => markLoaded(`${key}Artwork`)} onError={() => onRenderError?.(`The ${label.toLowerCase()} generated design could not be rendered on the mockup.`)} />
          </div>
        </div>
      ))}
    </div>
  );
}
