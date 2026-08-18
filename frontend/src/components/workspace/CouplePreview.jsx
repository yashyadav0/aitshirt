import { useRef, useState, useCallback, useLayoutEffect, useMemo } from "react";
import { Rnd } from "react-rnd";

export default function CouplePreview({

  generatedHisImage,
  generatedHerImage,

  getMockup,
  productType,

  hisColor,
  herColor,

  hisSide,
  herSide,

  hisTransform,
  onHisTransformChange,
  herTransform,
  onHerTransformChange

}) {

  const designStyles = useMemo(() => ({
    tshirt: { top: "50%", width: "48%" },
    hoodie: { top: "50%", width: "27%" },
    oversized: { top: "50%", width: "55%" },
    kids: { top: "50%", width: "34%" }
  }), []);

  const defaultStyle = designStyles[productType] || designStyles.tshirt;

  const defaultY = parseFloat(defaultStyle.top.replace("%", ""));
  const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));

  const defaultHisT = useMemo(() => ({
    x: 50,
    y: defaultY,
    widthPct: defaultWidthPct,
    rotation: 0
  }), [defaultY, defaultWidthPct]);

  const defaultHerT = useMemo(() => ({
    x: 50,
    y: defaultY,
    widthPct: defaultWidthPct,
    rotation: 0
  }), [defaultY, defaultWidthPct]);

  const hisT = hisTransform || defaultHisT;
  const herT = herTransform || defaultHerT;

  // Container dimensions — null until measured after mockup images load
  const [hisRect, setHisRect] = useState(null);
  const [herRect, setHerRect] = useState(null);
  const hisMockupRef = useRef(null);
  const herMockupRef = useRef(null);

  // Measure containers once the mockup images have loaded (guarantees valid height)
  const measureHisContainer = useCallback(() => {
    if (!hisMockupRef.current) return;
    const rect = hisMockupRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setHisRect(rect);
    }
  }, []);

  const measureHerContainer = useCallback(() => {
    if (!herMockupRef.current) return;
    const rect = herMockupRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setHerRect(rect);
    }
  }, []);

  // Also try measuring on mount (handles cached images)
  useLayoutEffect(() => {
    if (!hisRect) measureHisContainer();
  }, [measureHisContainer, hisRect]);

  useLayoutEffect(() => {
    if (!herRect) measureHerContainer();
  }, [measureHerContainer, herRect]);

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

  // His drag/resize
  const onHisDragStop = useCallback((e, d) => {
    if (!hisRect) return;
    const width = (hisT.widthPct / 100) * hisRect.width;
    const centerX = d.x + width / 2;
    const centerY = d.y + width / 2;
    onHisTransformChange?.({
      ...hisT,
      x: (centerX / hisRect.width) * 100,
      y: (centerY / hisRect.height) * 100
    });
  }, [hisRect, hisT, onHisTransformChange]);

  const onHisResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!hisRect) return;
    const newWidth = ref.offsetWidth;
    const newWidthPct = (newWidth / hisRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newWidth / 2;
    onHisTransformChange?.({
      ...hisT,
      widthPct: newWidthPct,
      x: (centerX / hisRect.width) * 100,
      y: (centerY / hisRect.height) * 100
    });
  }, [hisRect, hisT, onHisTransformChange]);

  // Her drag/resize
  const onHerDragStop = useCallback((e, d) => {
    if (!herRect) return;
    const width = (herT.widthPct / 100) * herRect.width;
    const centerX = d.x + width / 2;
    const centerY = d.y + width / 2;
    onHerTransformChange?.({
      ...herT,
      x: (centerX / herRect.width) * 100,
      y: (centerY / herRect.height) * 100
    });
  }, [herRect, herT, onHerTransformChange]);

  const onHerResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!herRect) return;
    const newWidth = ref.offsetWidth;
    const newWidthPct = (newWidth / herRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newWidth / 2;
    onHerTransformChange?.({
      ...herT,
      widthPct: newWidthPct,
      x: (centerX / herRect.width) * 100,
      y: (centerY / herRect.height) * 100
    });
  }, [herRect, herT, onHerTransformChange]);

  // Compute pixel values for his
  const hisWidth = hisRect ? (hisT.widthPct / 100) * hisRect.width : 0;
  const hisHeight = hisWidth;
  const hisX = hisRect ? (hisT.x / 100) * hisRect.width - hisWidth / 2 : 0;
  const hisY = hisRect ? (hisT.y / 100) * hisRect.height - hisHeight / 2 : 0;

  // Compute pixel values for her
  const herWidth = herRect ? (herT.widthPct / 100) * herRect.width : 0;
  const herHeight = herWidth;
  const herX = herRect ? (herT.x / 100) * herRect.width - herWidth / 2 : 0;
  const herY = herRect ? (herT.y / 100) * herRect.height - herHeight / 2 : 0;

  const sides = [
    {
      key: "his",
      label: "His",
      image: generatedHisImage,
      color: hisColor,
      side: hisSide,
      transform: hisT,
      width: hisWidth,
      height: hisHeight,
      x: hisX,
      y: hisY,
      mockupRef: hisMockupRef,
      measureContainer: measureHisContainer,
      onDragStop: onHisDragStop,
      onResizeStop: onHisResizeStop,
    },
    {
      key: "her",
      label: "Her",
      image: generatedHerImage,
      color: herColor,
      side: herSide,
      transform: herT,
      width: herWidth,
      height: herHeight,
      x: herX,
      y: herY,
      mockupRef: herMockupRef,
      measureContainer: measureHerContainer,
      onDragStop: onHerDragStop,
      onResizeStop: onHerResizeStop,
    }
  ];

  if (!generatedHisImage || !generatedHerImage) {
    return null;
  }

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

      {sides.map(({ key, label, image, color, side, transform, width, height, x, y, mockupRef, measureContainer, onDragStop, onResizeStop }) => (
        <div key={key} className="bg-[#171717] rounded-2xl overflow-hidden border border-[#2f2f2f] p-3">
          <div className="relative aspect-square">
            <img
              ref={mockupRef}
              src={getMockup(productType, color, side)}
              alt={`${label} mockup`}
              className="w-full h-full object-cover"
              onLoad={measureContainer}
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
                />
                {/* Rotation handle */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white cursor-pointer hover:bg-cyan-300 touch-none flex items-center justify-center"
                  style={{ pointerEvents: "auto", userSelect: "none", top: `-30px` }}
                  onMouseDown={(e) => {
                    const onChange = key === "his" ? onHisTransformChange : onHerTransformChange;
                    handleRotationStart(e, transform, onChange, mockupRef.current);
                  }}
                  onTouchStart={(e) => {
                    const onChange = key === "his" ? onHisTransformChange : onHerTransformChange;
                    handleRotationStart(e, transform, onChange, mockupRef.current);
                  }}
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