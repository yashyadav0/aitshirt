import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
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

  // Controlled Rnd state (top-left + size in pixels), derived from center percentages
  const [frontRnd, setFrontRnd] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [backRnd, setBackRnd] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [frontRect, setFrontRect] = useState(null);
  const [backRect, setBackRect] = useState(null);
  const frontRndRef = useRef(null);
  const backRndRef = useRef(null);
  const frontMockupRef = useRef(null);
  const backMockupRef = useRef(null);

  // Measure containers
  useLayoutEffect(() => {
    if (!frontMockupRef.current) return;
    setFrontRect(frontMockupRef.current.getBoundingClientRect());
  }, [frontMockupRef.current]);

  useLayoutEffect(() => {
    if (!backMockupRef.current) return;
    setBackRect(backMockupRef.current.getBoundingClientRect());
  }, [backMockupRef.current]);

  // Derive front Rnd position + size from transform percentages
  useLayoutEffect(() => {
    if (!frontRect) return;
    const width = (frontT.widthPct / 100) * frontRect.width;
    const height = width;
    const centerX = (frontT.x / 100) * frontRect.width;
    const centerY = (frontT.y / 100) * frontRect.height;
    setFrontRnd({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }, [frontRect, frontT.widthPct, frontT.x, frontT.y]);

  // Derive back Rnd position + size from transform percentages
  useLayoutEffect(() => {
    if (!backRect) return;
    const width = (backT.widthPct / 100) * backRect.width;
    const height = width;
    const centerX = (backT.x / 100) * backRect.width;
    const centerY = (backT.y / 100) * backRect.height;
    setBackRnd({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }, [backRect, backT.widthPct, backT.x, backT.y]);

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
    if (!frontRect) return;
    const centerX = d.x + frontRnd.width / 2;
    const centerY = d.y + frontRnd.height / 2;
    onFrontTransformChange?.({
      ...frontT,
      x: (centerX / frontRect.width) * 100,
      y: (centerY / frontRect.height) * 100
    });
    setFrontRnd((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [frontRect, frontRnd.width, frontRnd.height, frontT, onFrontTransformChange]);

  const onFrontResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!frontRect) return;
    const newWidth = ref.offsetWidth;
    const newHeight = newWidth;
    const newWidthPct = (newWidth / frontRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newHeight / 2;
    onFrontTransformChange?.({
      ...frontT,
      widthPct: newWidthPct,
      x: (centerX / frontRect.width) * 100,
      y: (centerY / frontRect.height) * 100
    });
    setFrontRnd({ x: rndPosition.x, y: rndPosition.y, width: newWidth, height: newHeight });
  }, [frontRect, frontT, onFrontTransformChange]);

  const onBackDragStop = useCallback((e, d) => {
    if (!backRect) return;
    const centerX = d.x + backRnd.width / 2;
    const centerY = d.y + backRnd.height / 2;
    onBackTransformChange?.({
      ...backT,
      x: (centerX / backRect.width) * 100,
      y: (centerY / backRect.height) * 100
    });
    setBackRnd((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [backRect, backRnd.width, backRnd.height, backT, onBackTransformChange]);

  const onBackResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!backRect) return;
    const newWidth = ref.offsetWidth;
    const newHeight = newWidth;
    const newWidthPct = (newWidth / backRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newHeight / 2;
    onBackTransformChange?.({
      ...backT,
      widthPct: newWidthPct,
      x: (centerX / backRect.width) * 100,
      y: (centerY / backRect.height) * 100
    });
    setBackRnd({ x: rndPosition.x, y: rndPosition.y, width: newWidth, height: newHeight });
  }, [backRect, backT, onBackTransformChange]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        { key: "front", label: "Front", image: frontImage, transform: frontT, rnd: frontRnd, mockupRef: frontMockupRef, rndRef: frontRndRef, onDragStop: onFrontDragStop, onResizeStop: onFrontResizeStop },
        { key: "back", label: "Back", image: backImage, transform: backT, rnd: backRnd, mockupRef: backMockupRef, rndRef: backRndRef, onDragStop: onBackDragStop, onResizeStop: onBackResizeStop }
      ].map(({ key, label, image, transform, rnd, mockupRef, rndRef, onDragStop, onResizeStop }) => (
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
              size={{ width: rnd.width, height: rnd.height }}
              position={{ x: rnd.x, y: rnd.y }}
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
                  onMouseDown={(e) => handleRotationStart(e, transform, (val) => onFrontTransformChange?.(val) || onBackTransformChange?.(val), mockupRef.current)}
                  onTouchStart={(e) => handleRotationStart(e, transform, (val) => onFrontTransformChange?.(val) || onBackTransformChange?.(val), mockupRef.current)}
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