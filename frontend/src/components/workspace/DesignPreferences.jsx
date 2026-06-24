import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import {
  PRODUCT_TYPES,
  DESIGN_TYPES,
  getColorsForProductType
} from "../../config/designPreferences";

function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="
        flex
        gap-1
        rounded-xl
        border
        border-[#2f2f2f]
        bg-[#121212]
        p-1
      "
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`
            flex-1
            min-h-11
            rounded-lg
            px-3
            py-2.5
            text-sm
            font-medium
            transition-all
            duration-200
            ${
              value === option.id
                ? "bg-[#2f2f2f] text-white shadow-sm"
                : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-white"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function DesignPreferences({
  preferences,
  setProductType,
  setDesignType,
  setColor,
  onDesignTypeChange
}) {
  const [isOpen, setIsOpen] = useState(true);

  const productOptions = Object.values(PRODUCT_TYPES);
  const designOptions = Object.values(DESIGN_TYPES);
  const colorOptions = getColorsForProductType(preferences.productType);
  const selectedColor =
    preferences.selectedColor || preferences.color;

  const handleDesignTypeChange = (designType) => {
    setDesignType(designType);
    onDesignTypeChange?.(designType);
  };

  return (
    <div
      className="
        mb-3
        overflow-hidden
        rounded-2xl
        border
        border-[#2f2f2f]
        bg-[#141414]
        transition-all
        duration-300
      "
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-3
          px-4
          py-3.5
          text-left
          transition-colors
          hover:bg-[#1a1a1a]
        "
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-cyan-500/10
              text-cyan-400
            "
          >
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Design Preferences
            </p>
            <p className="text-xs text-zinc-500">
              Configure apparel before generating
            </p>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`
            shrink-0
            text-zinc-400
            transition-transform
            duration-300
            ${isOpen ? "rotate-180" : "rotate-0"}
          `}
        />
      </button>

      <div
        className={`
          grid
          transition-all
          duration-300
          ease-in-out
          ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-[#2f2f2f] px-4 py-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Product Type
              </p>
              <SegmentedControl
                ariaLabel="Product type"
                options={productOptions}
                value={preferences.productType}
                onChange={setProductType}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Design Type
              </p>
              <SegmentedControl
                ariaLabel="Design type"
                options={designOptions}
                value={preferences.designType}
                onChange={handleDesignTypeChange}
              />
              <p className="mt-2 text-xs text-zinc-500">
                {DESIGN_TYPES[preferences.designType]?.description}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Color Preference
              </p>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColor(color.id)}
                    className="
                      group
                      flex
                      flex-col
                      items-center
                      gap-2
                    "
                    aria-label={`Select ${color.label}`}
                    aria-pressed={selectedColor === color.id}
                    >
                    <span
                      className={`
                        relative
                        h-11
                        w-11
                        rounded-full
                        border-2
                        transition-all
                        duration-200
                        group-hover:scale-105
                        ${
                          selectedColor === color.id
                            ? "border-white ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#141414]"
                            : "border-[#3f3f46] group-hover:border-zinc-400"
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span
                      className={`
                        text-xs
                        transition-colors
                        ${
                          selectedColor === color.id
                            ? "text-white"
                            : "text-zinc-500 group-hover:text-zinc-300"
                        }
                      `}
                    >
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
