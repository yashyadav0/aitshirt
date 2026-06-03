import { useState } from "react";
import { Rnd } from "react-rnd";

export default function SinglePreview({
  generatedImage,
  mockupRef,
  getMockup,
  selectedColor,
  selectedSide,
}) {
  const [selected, setSelected] = useState(false);

  if (!generatedImage) return null;

  return (
    <div className="mt-10 px-5">
      <div
        ref={mockupRef}
        className="relative rounded-[40px] bg-[#18181b]"
        onClick={() => setSelected(false)}
      >
        <img
          src={getMockup(selectedColor, selectedSide)}
          alt="mockup"
          className="w-full block select-none pointer-events-none"
          draggable={false}
        />

        <Rnd
          default={{
            x: 150,
            y: 150,
            width: 220,
            height: 220,
          }}
          bounds="parent"
          lockAspectRatio
          enableUserSelectHack={false}
          minWidth={50}
          minHeight={50}
          onMouseDown={(e) => {
            e.stopPropagation();
            setSelected(true);
          }}
          style={{
            zIndex: 100,
            border: selected
              ? "2px solid #06b6d4"
              : "none",
          }}
        >
          <img
            src={generatedImage}
            alt="design"
            className="
              w-full
              h-full
              object-contain
              select-none
              pointer-events-none
            "
            draggable={false}
          />
        </Rnd>
      </div>
    </div>
  );
}