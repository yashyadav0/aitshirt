import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { Rnd } from "react-rnd";

export default function SinglePreview({

  generatedImage,
  mockupRef,
  getMockup,

  productType,

  selectedColor,
  selectedSide,

  designTransform,
  onDesignTransformChange

}) {

  if (!generatedImage)
    return null;

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

  const defaultY = parseFloat(String(defaultStyle.top).replace("%", ""));
  const defaultWidthPct = parseFloat(String(defaultStyle.width).replace("%", ""));

  // Current transform — if customer hasn't moved it, fall back to default
  const transform = designTransform || {
    x: 50, // percentage of container (center X)
    y: defaultY, // percentage of container (center Y)
    widthPct: defaultWidthPct,
    rotation: 0
  };

  // State for Rnd controlled position (top-left in pixels)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const rndRef = useRef(null);

  // Initialize position from center percentages on mount/transform change
  useLayoutEffect(() => {
    if (!mockupRef.current || isInitialized) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const designWidth = (transform.widthPct / 100) * rect.width;
    const designHeight = designWidth; // square due to lockAspectRatio
    const centerX = (transform.x / 100) * rect.width;
    const centerY = (transform.y / 100) * rect.height;
    // Convert center to top-left for Rnd position
    setPosition({
      x: centerX - designWidth / 2,
      y: centerY - designHeight / 2
    });
    setIsInitialized(true);
  }, [mockupRef.current, transform.widthPct, transform.x, transform.y, isInitialized]);

  const handleRotationStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
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
  }, [mockupRef, transform, onDesignTransformChange]);

  const onDragStop = useCallback((e, d) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const designWidth = (transform.widthPct / 100) * rect.width;
    const designHeight = designWidth;
    // d.x, d.y from Rnd are top-left; convert to center percentages
    const centerX = d.x + designWidth / 2;
    const centerY = d.y + designHeight / 2;
    onDesignTransformChange?.({
      ...transform,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setPosition({ x: d.x, y: d.y });
  }, [mockupRef, transform, onDesignTransformChange]);

  const onResizeStop = useCallback((e, dir, ref, delta, rndPosition) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const newWidthPct = (ref.offsetWidth / rect.width) * 100;
    const newDesignWidth = (newWidthPct / 100) * rect.width;
    const newDesignHeight = newDesignWidth;
    // rndPosition is top-left; convert to center
    const centerX = rndPosition.x + newDesignWidth / 2;
    const centerY = rndPosition.y + newDesignHeight / 2;
    onDesignTransformChange?.({
      ...transform,
      widthPct: newWidthPct,
      x: (centerX / rect.width) * 100,
      y: (centerY / rect.height) * 100
    });
    setPosition({ x: rndPosition.x, y: rndPosition.y });
  }, [mockupRef, transform, onDesignTransformChange]);

  return (

    <div
      className="
        mt-6
        sm:mt-10
      "
    >

      <div
        ref={mockupRef}

        className="
          relative
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          bg-[#171717]
          border
          border-[#2f2f2f]
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
            block
          "
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
              src={generatedImage}
              alt="design"
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                pointerEvents: "none",
                userSelect: "none"
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