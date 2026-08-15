import {
  getColorsForProductType
} from "../../config/designPreferences";
import DesignScaleSlider from "./DesignScaleSlider";
import DesignTiltSlider from "./DesignTiltSlider";

export default function DoubleSideControls({

  productType,

  selectedColor,
  setSelectedColor,
  setPreferenceColor,

  designScale,
  setDesignScale,
  designTilt,
  setDesignTilt

}) {

  const colors =
    getColorsForProductType(productType);

  return (

    <div
      className="
        mt-4
        sm:mt-5
        bg-[#171717]
        rounded-xl
        sm:rounded-2xl
        p-3
        sm:p-4
        border
        border-[#2f2f2f]
      "
    >

      {/* COLOR PICKER */}

      <div
        className="
          flex
          justify-center
          gap-2
          sm:gap-3
          mb-2
          sm:mb-3
          flex-wrap
        "
      >

        {

          colors.map((color) => (

            <button

              key={color.id}

              onClick={() => {
                setSelectedColor(color.id);
                setPreferenceColor?.(color.id);
              }}

              className={`
                min-w-11
                min-h-11
                sm:w-12
                sm:h-12
                rounded-full
                border
                border-[#3f3f46]
                transition-all
                flex-shrink-0

                ${
                  selectedColor === color.id

                    ? "ring-2 ring-white scale-105"

                    : ""
                }
              `}

              style={{
                backgroundColor:
                  color.hex
              }}
              aria-label={`Select ${color.label}`}
            />

          ))
        }

      </div>


      {/* FRONT / BACK NOTE */}

      <div
        className="
          w-full
          min-h-12
          flex
          items-center
          justify-center
          rounded-xl
          sm:rounded-2xl
          bg-[#202020]
          text-xs
          sm:text-sm
          font-medium
          text-zinc-200
        "
      >

        This color applies to both the front and back sides

      </div>

      <DesignScaleSlider
        designScale={designScale}
        setDesignScale={setDesignScale}
      />

      <DesignTiltSlider
        designTilt={designTilt}
        setDesignTilt={setDesignTilt}
      />

    </div>
  );
}
