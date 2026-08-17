import { useRef, useState, useCallback, useLayoutEffect } from "react";
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

  // Controlled Rnd state (top-left + size in pixels), derived from center percentages
  const [hisRnd, setHisRnd] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [herRnd, setHerRnd] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [hisRect, setHisRect] = useState(null);
  const [herRect, setHerRect] = useState(null);
  const hisMockupRef = useRef(null);
  const herMockupRef = useRef(null);

  // Measure containers
  useLayoutEffect(() => {
    if (!hisMockupRef.current) return;
    setHisRect(hisMockupRef.current.getBoundingClientRect());
  }, [hisMockupRef.current]);

  useLayoutEffect(() => {
    if (!herMockupRef.current) return;
    setHerRect(herMockupRef.current.getBoundingClientRect());
  }, [herMockupRef.current]);

  // Derive his Rnd position + size from transform percentages
  useLayoutEffect(() => {
    if (!hisRect) return;
    const width = (hisT.widthPct / 100) * hisRect.width;
    const height = width;
    const centerX = (hisT.x / 100) * hisRect.width;
    const centerY = (hisT.y / 100) * hisRect.height;
    setHisRnd({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }, [hisRect, hisT.widthPct, hisT.x, hisT.y]);

  // Derive her Rnd position + size from transform percentages
  useLayoutEffect(() => {
    if (!herRect) return;
    const width = (herT.widthPct / 100) * herRect.width;
    const height = width;
    const centerX = (herT.x / 100) * herRect.width;
    const centerY = (herT.y / 100) * herRect.height;
    setHerRnd({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }, [herRect, herT.widthPct, herT.x, herT.y]);

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
    if (!hisRect) return;
    const centerX = d.x + hisRnd.width / 2;
    const centerY = d.y + hisRnd.height / 2;
    onHisTransformChange?.({
      ...hisT,
      x: (centerX / hisRect.width) * 100,
      y: (centerY / hisRect.height) * 100
    });
    setHisRnd((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [hisRect, hisRnd.width, hisRnd.height, hisT, onHisTransformChange]);

  const onHisResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!hisRect) return;
    const newWidth = ref.offsetWidth;
    const newHeight = newWidth;
    const newWidthPct = (newWidth / hisRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newHeight / 2;
    onHisTransformChange?.({
      ...hisT,
      widthPct: newWidthPct,
      x: (centerX / hisRect.width) * 100,
      y: (centerY / hisRect.height) * 100
    });
    setHisRnd({ x: rndPosition.x, y: rndPosition.y, width: newWidth, height: newHeight });
  }, [hisRect, hisT, onHisTransformChange]);

  const onHerDragStop = useCallback((e, d) => {
    if (!herRect) return;
    const centerX = d.x + herRnd.width / 2;
    const centerY = d.y + herRnd.height / 2;
    onHerTransformChange?.({
      ...herT,
      x: (centerX / herRect.width) * 100,
      y: (centerY / herRect.height) * 100
    });
    setHerRnd((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [herRect, herRnd.width, herRnd.height, herT, onHerTransformChange]);

  const onHerResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!herRect) return;
    const newWidth = ref.offsetWidth;
    const newHeight = newWidth;
    const newWidthPct = (newWidth / herRect.width) * 100;
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newHeight / 2;
    onHerTransformChange?.({
      ...herT,
      widthPct: newWidthPct,
      x: (centerX / herRect.width) * 100,
      y: (centerY / herRect.height) * 100
    });
    setHerRnd({ x: rndPosition.x, y: rndPosition.y, width: newWidth, height: newHeight });
  }, [herRect, herT, onHerTransformChange]);

  const sides = [
    {
      key: "his",
      label: "His",
      image: generatedHisImage,
      color: hisColor,
      side: hisSide,
      transform: hisT,
      rnd: hisRnd,
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
      rnd: herRnd,
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

      {sides.map(({ key, label, image, color, side, transform, rnd, mockupRef, onDragStop, onResizeStop }) => (
        <div key={key} className="bg-[#171717] rounded-2xl overflow-hidden border border-[#2f2f2f] p-3">
          <div className="relative aspect-square">
            <img
              ref={mockupRef}
              src={getMockup(productType, color, side)}
              alt={`${label} mockup`}
              className="w-full h-full object-cover"
            />
            <Rnd
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