import { useEffect, useRef, useState, useCallback, useLayoutEffect, useMemo } from "react";
import { Rnd } from "react-rnd";

export default function DoubleSidePreview({
  frontImage,
  backImage,
  getMockup,
  productType,
  selectedColor,
  isLoading = false,
  onRendered,
  onRenderError,
  frontTransform,
  onFrontTransformChange,
  backTransform,
  onBackTransformChange
}) {
  const renderKey = [frontImage, backImage, productType, selectedColor].join("|");
  const [loaded, setLoaded] = useState({ key: "", frontMockup: false, frontArtwork: false, backMockup: false, backArtwork: false });
  const reportedKey = useRef("");

  // Memoize default styles
  const defaultStyle = useMemo(() => {
    const designStyles = {
      tshirt: { top: "50%", width: "48%" },
      hoodie: { top: "50%", width: "27%" },
      oversized: { top: "50%", width: "55%" },
      kids: { top: "50%", width: "40%" }
    };
    return designStyles[productType] || designStyles.tshirt;
  }, [productType]);

  const defaultY = parseFloat(defaultStyle.top.replace("%", ""));
  const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));

  // Memoize default transforms
  const defaultFrontT = useMemo(() => ({ x: 50, y: defaultY, widthPct: defaultWidthPct, rotation: 0 }), [defaultY, defaultWidthPct]);
  const defaultBackT = useMemo(() => ({ x: 50, y: defaultY, widthPct: defaultWidthPct, rotation: 0 }), [defaultY, defaultWidthPct]);

  const frontT = frontTransform || defaultFrontT;
  const backT = backTransform || defaultBackT;

  // Container dimensions — null until measured after mockup images load
  const [frontRect, setFrontRect] = useState(null);
  const [backRect, setBackRect] = useState(null);
  const frontMockupRef = useRef(null);
  const backMockupRef = useRef(null);

  // Measure containers once the mockup images have loaded (guarantees valid height)
  const measureFrontContainer = useCallback(() => {
    if (!frontMockupRef.current) return;
    const rect = frontMockupRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setFrontRect(rect);
    }
  }, []);

  const measureBackContainer = useCallback(() => {
    if (!backMockupRef.current) return;
    const rect = backMockupRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setBackRect(rect);
    }
  }, []);

  // Also try measuring on mount (handles cached images)
  useLayoutEffect(() => {
    if (!frontRect) measureFrontContainer();
  }, [measureFrontContainer, frontRect]);

  useLayoutEffect(() => {
    if (!backRect) measureBackContainer();
  }, [measureBackContainer, backRect]);

  const handleRotationStart = useCallback((e, transform, onChange, mockupEl) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = mockupEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleRotation = (moveEvent) => {
      const touchPoint = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
      const angle = Math.atan2(touchPoint.clientY - centerY, touchPoint.clientX - centerX) * 180 / Math.PI;
      onChange?.({
        ...transform,
        rotation: angle
      });
    };

    const stopRotation = () => {
      window.removeEventListener('mousemove', handleRotation);
      window.removeEventListener('mouseup', stopRotation);
      window.removeEventListener('touchmove', handleRotation);
      window.removeEventListener('touchend', stopRotation);
    };

    window.addEventListener('mousemove', handleRotation);
    window.addEventListener('mouseup', stopRotation);
    window.addEventListener('touchmove', handleRotation, { passive: false });
    window.addEventListener('touchend', stopRotation);
  }, []);

  const markLoaded = (part) => setLoaded((current) => {
    const next = current.key === renderKey
      ? current
      : { key: renderKey, frontMockup: false, frontArtwork: false, backMockup: false, backArtwork: false };
    return { ...next, [part]: true };
  });

  // Front drag/resize
  const onFrontDragStop = useCallback((e, d) => {
    if (!frontRect) return;
    const width = (frontT.widthPct / 100) * frontRect.width;
    const centerX = d.x + width / 2;
    const centerY = d.y + width / 2;
    onFrontTransformChange?.({
      ...frontT,
      x: (centerX / frontRect.width) * 100,
      y: (centerY / frontRect.height) * 100
    });
  }, [frontRect, frontT, onFrontTransformChange]);

  const onFrontResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!frontRect) return;
    const newWidth = ref.offsetWidth;
    const newWidthPct = (newWidth / frontRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newWidth / 2;
    onFrontTransformChange?.({
      ...frontT,
      widthPct: newWidthPct,
      x: (centerX / frontRect.width) * 100,
      y: (centerY / frontRect.height) * 100
    });
  }, [frontRect, frontT, onFrontTransformChange]);

  // Back drag/resize
  const onBackDragStop = useCallback((e, d) => {
    if (!backRect) return;
    const width = (backT.widthPct / 100) * backRect.width;
    const centerX = d.x + width / 2;
    const centerY = d.y + width / 2;
    onBackTransformChange?.({
      ...backT,
      x: (centerX / backRect.width) * 100,
      y: (centerY / backRect.height) * 100
    });
  }, [backRect, backT, onBackTransformChange]);

  const onBackResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!backRect) return;
    const newWidth = ref.offsetWidth;
    const newWidthPct = (newWidth / backRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newWidth / 2;
    onBackTransformChange?.({
      ...backT,
      widthPct: newWidthPct,
      x: (centerX / backRect.width) * 100,
      y: (centerY / backRect.height) * 100
    });
  }, [backRect, backT, onBackTransformChange]);

  // Compute pixel values for front
  const frontWidth = frontRect ? (frontT.widthPct / 100) * frontRect.width : 0;
  const frontHeight = frontWidth;
  const frontX = frontRect ? (frontT.x / 100) * frontRect.width - frontWidth / 2 : 0;
  const frontY = frontRect ? (frontT.y / 100) * frontRect.height - frontHeight / 2 : 0;

  // Compute pixel values for back
  const backWidth = backRect ? (backT.widthPct / 100) * backRect.width : 0;
  const backHeight = backWidth;
  const backX = backRect ? (backT.x / 100) * backRect.width - backWidth / 2 : 0;
  const backY = backRect ? (backT.y / 100) * backRect.height - backHeight / 2 : 0;

  const rendered = loaded.key === renderKey && loaded.frontMockup && loaded.frontArtwork && loaded.backMockup && loaded.backArtwork;

  useEffect(() => {
    if (frontImage && backImage && rendered && reportedKey.current !== renderKey) {
      reportedKey.current = renderKey;
      onRendered?.();
    }
  }, [backImage, frontImage, onRendered, renderKey, rendered]);

  if (!frontImage || !backImage) {
    return isLoading ? <div className="mt-8 aspect-square animate-pulse rounded-2xl bg-[#202020]" /> : null;
  }

  const sides = [
    { key: "front", label: "Front", image: frontImage, transform: frontT, width: frontWidth, height: frontHeight, x: frontX, y: frontY, mockupRef: frontMockupRef, measureContainer: measureFrontContainer, onDragStop: onFrontDragStop, onResizeStop: onFrontResizeStop },
    { key: "back", label: "Back", image: backImage, transform: backT, width: backWidth, height: backHeight, x: backX, y: backY, mockupRef: backMockupRef, measureContainer: measureBackContainer, onDragStop: onBackDragStop, onResizeStop: onBackResizeStop }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sides.map(({ key, label, image, transform, width, height, x, y, mockupRef, measureContainer, onDragStop, onResizeStop }) => (
        <div key={key} className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
          <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
          <div className="relative aspect-square">
            <img
              ref={mockupRef}
              src={getMockup(productType, selectedColor, key)}
              alt={`${label} mockup`}
              className="h-full w-full object-cover"
              onLoad={() => { markLoaded(`${key}Mockup`); measureContainer(); }}
              onError={() => onRenderError?.(`The ${label.toLowerCase()} product mockup could not be loaded.`)}
            />
            <Rnd
              size={{ width, height }}
              position={{ x, y }}
              lockAspectRatio
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              bounds="parent"
              className="cursor-move"
              style={{ touchAction: "none", display: "block" }}
            >
              <div
                style={{
                  transform: `rotate(${transform.rotation}deg)`,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src={image}
                  alt={`${label} design`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "block"
                  }}
                  onLoad={() => markLoaded(`${key}Artwork`)}
                  onError={() => onRenderError?.(`The ${label.toLowerCase()} generated design could not be rendered on the mockup.`)}
                />
                {/* Rotation handle */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white cursor-pointer hover:bg-cyan-300 touch-none flex items-center justify-center"
                  style={{ pointerEvents: "auto", userSelect: "none", top: `-30px` }}
                  onMouseDown={(e) => handleRotationStart(e, transform, key === "front" ? onFrontTransformChange : onBackTransformChange, mockupRef.current)}
                  onTouchStart={handleRotationStart}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </div>
              </div>
            </Rnd>
          </div>
        </div>
      ))}
    </div>
  );
}