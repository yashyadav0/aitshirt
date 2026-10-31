import { getColorsForProductType } from "../../config/designPreferences";

export default function SingleControls({

  selectedColor,
  setSelectedColor,
  setPreferenceColor,
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
                  ? "ring-2 ring-cyan-400 scale-105"
                  : ""
              }`}

              style={{
                backgroundColor:
                  color.hex
              }}
              aria-label={`Select ${color.label}`}
            />

          ))
        }

      </div>


    </div>
  );
}
