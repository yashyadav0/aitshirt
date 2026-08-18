import { useRef, useLayoutEffect, useState, useCallback, useMemo } from "react";
import { Rnd } from "react-rnd";

export default function SinglePreview({

  generatedImage,
  getMockup,

  productType,

  selectedColor,
  selectedSide,

  designTransform,
  onDesignTransformChange

}) {

  // Memoize default style so it doesn't change on every render
  const defaultStyle = useMemo(() => {
    const designStyles = {
      tshirt: { top: "50%", width: "48%" },
      hoodie: { top: "50%", width: "27%" },
      oversized: { top: "50%", width: "55%" },
      kids: { top: "50%", width: "34%" }
    };
    return designStyles[productType] || designStyles.tshirt;
  }, [productType]);

  const defaultY = parseFloat(String(defaultStyle.top).replace("%", ""));
  const defaultWidthPct = parseFloat(String(defaultStyle.width).replace("%", ""));

  // Memoize default transform
  const defaultTransform = useMemo(() => ({
    x: 50,
    y: defaultY,
    widthPct: defaultWidthPct,
    rotation: 0
  }), [defaultY, defaultWidthPct]);

  // Current transform — if customer hasn't moved it, fall back to default
  const transform = designTransform || defaultTransform;

  // Container dimensions — null until measured after mockup image loads
  const [containerRect, setContainerRect] = useState(null);
  const rndRef = useRef(null);
  // Local ref for the mockup image container (parent of Rnd)
  const containerRef = useRef(null);

  // Measure container once the mockup image has loaded (guarantees valid height)
  const measureContainer = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerRect(rect);
    }
  }, []);

  // Also try measuring on mount (handles cached images)
  useLayoutEffect(() => {
    if (!containerRect) measureContainer();
  }, [measureContainer, containerRect]);

  // Compute pixel position from center percentages
  const rndWidth = containerRect ? (transform.widthPct / 100) * containerRect.width : 0;
  const rndHeight = rndWidth; // square due to lockAspectRatio
  const rndX = containerRect ? (transform.x / 100) * containerRect.width - rndWidth / 2 : 0;
  const rndY = containerRect ? (transform.y / 100) * containerRect.height - rndHeight / 2 : 0;

  const handleRotationStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleRotation = (moveEvent) => {
      const touchPoint = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
      const angle = Math.atan2(touchPoint.clientY - centerY, touchPoint.clientX - centerX) * 180 / Math.PI;
      onDesignTransformChange?.({
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
  }, [transform, onDesignTransformChange]);

  const onDragStop = useCallback((e, d) => {
    if (!containerRect) return;
    const width = (transform.widthPct / 100) * containerRect.width;
    // d.x, d.y from Rnd are top-left; convert to center percentages
    const centerX = d.x + width / 2;
    const centerY = d.y + width / 2;
    onDesignTransformChange?.({
      ...transform,
      x: (centerX / containerRect.width) * 100,
      y: (centerY / containerRect.height) * 100
    });
  }, [containerRect, transform, onDesignTransformChange]);

  const onResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!containerRect) return;
    const newWidth = ref.offsetWidth;
    const newWidthPct = (newWidth / containerRect.width) * 100;
    // rndPosition is top-left; convert to center
    const centerX = rndPosition.x + newWidth / 2;
    const centerY = rndPosition.y + newWidth / 2;
    onDesignTransformChange?.({
      ...transform,
      widthPct: newWidthPct,
      x: (centerX / containerRect.width) * 100,
      y: (centerY / containerRect.height) * 100
    });
  }, [containerRect, transform, onDesignTransformChange]);

  if (!generatedImage)
    return null;

  return (

    <div
      className="
        mt-6
        sm:mt-10
      "
    >

      <div
        ref={containerRef}
        className="
          relative
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          bg-[#171717]
          border
          border-[#2f2f2f]
          aspect-square
        "
      >

        <img

          src={
            getMockup(
              productType,
              selectedColor,
              selectedSide
            )
          }

          alt="mockup"

          className="
            w-full
            h-full
            object-cover
            block
          "
          onLoad={measureContainer}
        />

        <Rnd
          ref={rndRef}
          size={{ width: rndWidth, height: rndHeight }}
          position={{ x: rndX, y: rndY }}
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
              src={generatedImage}
              alt="design"
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

            {/* Rotation handle - fixed radius from center */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400 border-2 border-white cursor-pointer hover:bg-cyan-300 touch-none flex items-center justify-center"
              style={{
                pointerEvents: "auto",
                userSelect: "none",
                top: `-30px` // fixed distance from center (not from element edge)
              }}
              onMouseDown={handleRotationStart}
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
  );
}