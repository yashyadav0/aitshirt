import { useEffect, useRef, useState, useCallback } from "react";
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

  const designStyles = {

    tshirt: {

      top: "50%",
      width: "48%"
    },

    hoodie: {

      top: "42%",
      width: "27%"
    },

    oversized: {

      top: "42%",
      width: "55%"
    },

    kids: {

      top: "44%",
      width: "34%"
    }
  };

  const defaultStyle =
    designStyles[
      productType
    ] || designStyles.tshirt;

  const defaultY = parseFloat(defaultStyle.top.replace("%", ""));
  const defaultWidthPct = parseFloat(defaultStyle.width.replace("%", ""));

  const hisT = hisTransform || {
    x: 50,
    y: defaultY,
    widthPct: defaultWidthPct,
    rotation: 0
  };

  const herT = herTransform || {
    x: 50,
    y: defaultY,
    widthPct: defaultWidthPct,
    rotation: 0
  };

  // Position state for Rnd (top-left in pixels)
  const [hisPosition, setHisPosition] = useState({ x: 0, y: 0 });
  const [herPosition, setHerPosition] = useState({ x: 0, y: 0 });
  const [hisInitialized, setHisInitialized] = useState(false);
  const [herInitialized, setHerInitialized] = useState(false);
  const hisMockupRef = useRef(null);
  const herMockupRef = useRef(null);

  // Initialize his position from center percentages
  useEffect(() => {
    if (!hisMockupRef.current || hisInitialized) return;
    const rect = hisMockupRef.current.getBoundingClientRect();
    const designWidth = (hisT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = (hisT.x / 100) * rect.width;
    const centerY = (hisT.y / 100) * rect.height;
    setHisPosition({
      x: centerX - designWidth / 2,
      y: centerY - designHeight / 2
    });
    setHisInitialized(true);
  }, [hisMockupRef.current, hisT.widthPct, hisT.x, hisT.y, hisInitialized]);

  // Initialize her position from center percentages
  useEffect(() => {
    if (!herMockupRef.current || herInitialized) return;
    const rect = herMockupRef.current.getBoundingClientRect();
    const designWidth = (herT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = (herT.x / 100) * rect.width;
    const centerY = (herT.y / 100) * rect.height;
    setHerPosition({
      x: centerX - designWidth / 2,
      y: centerY - designHeight / 2
    });
    setHerInitialized(true);
  }, [herMockupRef.current, herT.widthPct, herT.x, herT.y, herInitialized]);

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

  const onHisDragStop = useCallback((e, d) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const designWidth = (hisT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = d.x + designWidth / 2;
    const centerY = d.y + designHeight / 2;
    onHisTransformChange?.({
      ...hisT,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setHisPosition({ x: d.x, y: d.y });
  }, [hisT, onHisTransformChange]);

  const onHisResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const newWidthPct = (ref.offsetWidth / rect.width) * 100;
    const newDesignWidth = (newWidthPct / 100) * rect.width;
    const newDesignHeight = newDesignWidth;
    const centerX = rndPosition.x + newDesignWidth / 2;
    const centerY = rndPosition.y + newDesignHeight / 2;
    onHisTransformChange?.({
      ...hisT,
      widthPct: newWidthPct,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setHisPosition({ x: rndPosition.x, y: rndPosition.y });
  }, [hisT, onHisTransformChange]);

  const onHerDragStop = useCallback((e, d) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const designWidth = (herT.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    const centerX = d.x + designWidth / 2;
    const centerY = d.y + designHeight / 2;
    onHerTransformChange?.({
      ...herT,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setHerPosition({ x: d.x, y: d.y });
  }, [herT, onHerTransformChange]);

  const onHerResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    const mockupEl = e.target.closest('.aspect-square');
    const rect = mockupEl?.getBoundingClientRect();
    if (!rect) return;
    const newWidthPct = (ref.offsetWidth / rect.width) * 100;
    const newDesignWidth = (newWidthPct / 100) * rect.width;
    const newDesignHeight = newDesignWidth;
    const centerX = rndPosition.x + newDesignWidth / 2;
    const centerY = rndPosition.y + newDesignHeight / 2;
    onHerTransformChange?.({
      ...herT,
      widthPct: newWidthPct,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setHerPosition({ x: rndPosition.x, y: rndPosition.y });
  }, [herT, onHerTransformChange]);

  const sides = [
    {
      key: "his",
      label: "His",
      image: generatedHisImage,
      color: hisColor,
      side: hisSide,
      transform: hisT,
      onChange: onHisTransformChange,
      position: hisPosition,
      mockupRef: hisMockupRef,
      onDragStop: onHisDragStop,
      onResizeStop: onHisResizeStop
    },
    {
      key: "her",
      label: "Her",
      image: generatedHerImage,
      color: herColor,
      side: herSide,
      transform: herT,
      onChange: onHerTransformChange,
      position: herPosition,
      mockupRef: herMockupRef,
      onDragStop: onHerDragStop,
      onResizeStop: onHerResizeStop
    }
  ];

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

      {sides.map(({ key, label, image, color, side, transform, onChange, position, mockupRef, onDragStop, onResizeStop }) => (
        <div key={key} className="bg-[#171717] rounded-2xl overflow-hidden border border-[#2f2f2f] p-3">
          <div className="relative aspect-square">
            <img
              ref={mockupRef}
              src={getMockup(productType, color, side)}
              alt={`${label} mockup`}
              className="w-full h-full object-cover"
            />
            <Rnd
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