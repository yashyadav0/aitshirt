import { useEffect, useRef, useState, useCallback } from "react";
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

  const designStyles = {
    tshirt: { top: "50%", width: "48%" },
    hoodie: { top: "42%", width: "27%" },
    oversized: { top: "42%", width: "55%" },
    kids: { top: "42%", width: "40%" }
  };
  const defaultStyle = designStyles[productType] || designStyles.tshirt;

  const defaultY = parseFloat(defaultStyle.top.replace("%", ""));
  const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));

  const frontT = frontTransform || { x: 50, y: defaultY, widthPct: defaultWidthPct, rotation: 0 };
  const backT = backTransform || { x: 50, y: defaultY, widthPct: defaultWidthPct, rotation: 0 };

  // Position state for Rnd (top-left in pixels)
  const [frontPosition, setFrontPosition] = useState({ x: 0, y: 0 });
  const [backPosition, setBackPosition] = useState({ x: 0, y: 0 });
  const [frontInitialized, setFrontInitialized] = useState(false);
  const [backInitialized, setBackInitialized] = useState(false);
  const frontRndRef = useRef(null);
  const backRndRef = useRef(null);
  const frontMockupRef = useRef(null);
  const backMockupRef = useRef(null);

  // Initialize front position from center percentages
  useEffect(() => {
    if (!frontMockupRef.current || frontInitialized) return;
    const rect = frontMockupRef.current.getBoundingClientRect();
    const designWidth = (frontT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = (frontT.x / 100) * rect.width;
    const centerY = (frontT.y / 100) * rect.height;
    setFrontPosition({
      x: centerX - designWidth / 2,
      y: centerY - designHeight / 2
    });
    setFrontInitialized(true);
  }, [frontMockupRef.current, frontT.widthPct, frontT.x, frontT.y, frontInitialized]);

  // Initialize back position from center percentages
  useEffect(() => {
    if (!backMockupRef.current || backInitialized) return;
    const rect = backMockupRef.current.getBoundingClientRect();
    const designWidth = (backT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = (backT.x / 100) * rect.width;
    const centerY = (backT.y / 100) * rect.height;
    setBackPosition({
      x: centerX - designWidth / 2,
      y: centerY - designHeight / 2
    });
    setBackInitialized(true);
  }, [backMockupRef.current, backT.widthPct, backT.x, backT.y, backInitialized]);

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

  const onFrontDragStop = useCallback((e, d) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const designWidth = (frontT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = d.x + designWidth / 2;
    const centerY = d.y + designHeight / 2;
    onFrontTransformChange?.({
      ...frontT,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setFrontPosition({ x: d.x, y: d.y });
  }, [frontT, onFrontTransformChange]);

  const onFrontResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const newWidthPct = (ref.offsetWidth / rect.width) * 100;
    const newDesignWidth = (newWidthPct / 100) * rect.width;
    const newDesignHeight = newDesignWidth;
    const centerX = rndPosition.x + newDesignWidth / 2;
    const centerY = rndPosition.y + newDesignHeight / 2;
    onFrontTransformChange?.({
      ...frontT,
      widthPct: newWidthPct,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setFrontPosition({ x: rndPosition.x, y: rndPosition.y });
  }, [frontT, onFrontTransformChange]);

  const onBackDragStop = useCallback((e, d) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const designWidth = (backT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = d.x + designWidth / 2;
    const centerY = d.y + designHeight / 2;
    onBackTransformChange?.({
      ...backT,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setBackPosition({ x: d.x, y: d.y });
  }, [backT, onBackTransformChange]);

  const onBackResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const newWidthPct = (ref.offsetWidth / rect.width) * 100;
    const newDesignWidth = (newWidthPct / 100) * rect.width;
    const newDesignHeight = newDesignWidth;
    const centerX = rndPosition.x + newDesignWidth / 2;
    const centerY = rndPosition.y + newDesignHeight / 2;
    onBackTransformChange?.({
      ...backT,
      widthPct: newWidthPct,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setBackPosition({ x: rndPosition.x, y: rndPosition.y });
  }, [backT, onBackTransformChange]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        { key: "front", label: "Front", image: frontImage, transform: frontT, onChange: onFrontTransformChange, position: frontPosition, setPosition: setFrontPosition, rndRef: frontRndRef, mockupRef: frontMockupRef, onDragStop: onFrontDragStop, onResizeStop: onFrontResizeStop },
        { key: "back", label: "Back", image: backImage, transform: backT, onChange: onBackTransformChange, position: backPosition, setPosition: setBackPosition, rndRef: backRndRef, mockupRef: backMockupRef, onDragStop: onBackDragStop, onResizeStop: onBackResizeStop }
      ].map(({ key, label, image, transform, onChange, position, setPosition, rndRef, mockupRef, onDragStop, onResizeStop }) => (
        <div key={key} className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-[#171717] p-3">
          <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
          <div className="relative aspect-square">
            <img
              ref={mockupRef}
              src={getMockup(productType, selectedColor, key)}
              alt={`${label} mockup`}
              className="h-full w-full object-cover"
              onLoad={() => markLoaded(`${key}Mockup`)}
              onError={() => onRenderError?.(`The ${label.toLowerCase()} product mockup could not be loaded.`)}
            />
            <Rnd
              ref={rndRef}
              size={{ width: `${transform.widthPct}%`, height: "auto" }}
              position={position}
              lockAspectRatio
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              bounds="parent"
              className="cursor-move"
              style={{ touchAction: "none" }}
            >
              <div
                style={{
                  transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
                  width: "100%",
                  height: "100%"
                }}
              >
                <img
                  src={image}
                  alt={`${label} design`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none"
                  }}
                  onLoad={() => markLoaded(`${key}Artwork`)}
                  onError={() => onRenderError?.(`The ${label.toLowerCase()} generated design could not be rendered on the mockup.`)}
                />
                {/* Rotation handle */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white cursor-pointer hover:bg-cyan-300 touch-none flex items-center justify-center"
                  style={{ pointerEvents: "auto", userSelect: "none", top: `-30px` }}
                  onMouseDown={(e) => handleRotationStart(e, transform, onChange, mockupRef.current)}
                  onTouchStart={(e) => handleRotationStart(e, transform, onChange, mockupRef.current)}
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