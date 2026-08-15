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
  designScale = 45,
  designTilt = 0
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

  // Chest center in canvas is at Y=360 on 1040 mockup = ~34.6% from mockup top
  // Mockup drawn at -120 offset on 800 canvas, so chest center is at 360px
  // 360/800 = 45% of canvas height. Mockup is 1040px tall, so chest center is at 480px in mockup coords
  // 480/1040 = 46.15% from mockup top
  const designStyles = {
    tshirt: { top: "46%", baseWidth: "55%" },
    hoodie: { top: "46%", baseWidth: "52%" },
    oversized: { top: "46%", baseWidth: "55%" },
    kids: { top: "46%", baseWidth: "40%" }
  };

  const styleConfig = designStyles[productType] || designStyles.tshirt;
  const scaledWidth = `${parseFloat(styleConfig.baseWidth) * (designScale / 45)}%`;
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
            <img
              src={image}
              alt={`${label} design`}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{
                top: styleConfig.top,
                left: "50%",
                width: scaledWidth,
                transform: `rotate(${designTilt}deg)`
              }}
              onLoad={() => markLoaded(`${key}Artwork`)}
              onError={() => onRenderError?.(`The ${label.toLowerCase()} generated design could not be rendered on the mockup.`)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}