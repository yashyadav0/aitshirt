import { getColorsForProductType } from "../../config/designPreferences";

export default function SingleControls({

  selectedColor,
  setSelectedColor,
  setPreferenceColor,

  selectedSide,
  setSelectedSide,

  productType

}) {

  const colors = getColorsForProductType(productType);

  return (

    <div className="workspace-single-controls">

      {/* COLOR PICKER */}

      <div className="workspace-color-swatches">

        {

          colors.map((color) => (

            <button

              key={color.id}

            onClick={() => {
                setSelectedColor(color.id);
                setPreferenceColor?.(color.id);
              }}

              className={`workspace-color-swatch ${
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


      {/* FRONT / BACK */}

      <button

        onClick={() =>

          setSelectedSide(

            selectedSide === "front"

              ? "back"

              : "front"
          )
        }

        className="workspace-side-toggle"
      >

        {selectedSide === "front" ? "Front" : "Back"}

      </button>

      <div className="workspace-color-help">
        Drag the design to reposition • Drag corners to resize • Use the rotate handle to tilt
      </div>

    </div>
  );
}
