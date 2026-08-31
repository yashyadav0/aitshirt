export const DESIGN_TYPES = {
  single: {
    id: "single",
    label: "Single Design",
    description: "One design generated"
  },
  couple: {
    id: "couple",
    label: "Couple Design",
    description: "Two matching designs as a pair"
  },
  double: {
    id: "double",
    label: "Double Side",
    description: "Front and back designs on one garment"
  }
};

// Default product types (fallback when no localStorage override)
const DEFAULT_PRODUCT_TYPES = {
  tshirt: {
    id: "tshirt",
    label: "T-Shirt",
    colors: [
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "black", label: "Black", hex: "#000000" },
      { id: "red", label: "Red", hex: "#dc2626" }
    ]
  },
  hoodie: {
    id: "hoodie",
    label: "Hoodie",
    colors: [
      { id: "black", label: "Black", hex: "#000000" },
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "blue", label: "Navy Blue", hex: "#1e3a5f" }
    ]
  },
  oversized: {
    id: "oversized",
    label: "Oversized",
    colors: [
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "black", label: "Black", hex: "#000000" },
      { id: "red", label: "Red", hex: "#dc2626" }
    ]
  },
  kids: {
    id: "kids",
    label: "Kids",
    colors: [
      { id: "white", label: "White", hex: "#ffffff" },
      { id: "black", label: "Black", hex: "#000000" },
      { id: "red", label: "Red", hex: "#dc2626" }
    ]
  }
};

// Get product types with localStorage overrides applied
export function getProductTypes() {
  if (typeof window === "undefined") return DEFAULT_PRODUCT_TYPES;

  try {
    const stored = localStorage.getItem("productTypesOverride");
    if (!stored) return DEFAULT_PRODUCT_TYPES;

    const overrides = JSON.parse(stored);
    // Merge defaults with overrides
    const merged = { ...DEFAULT_PRODUCT_TYPES };

    Object.keys(overrides).forEach(productType => {
      if (merged[productType]) {
        merged[productType] = {
          ...merged[productType],
          ...overrides[productType],
          // Merge colors: defaults + custom (custom overrides defaults by id)
          colors: mergeColors(merged[productType].colors, overrides[productType].colors || [])
        };
      } else {
        // New product type added by admin
        merged[productType] = overrides[productType];
      }
    });

    // Also handle removed colors (colors in override with empty array or filtered out)
    // This is handled by the mergeColors function

    return merged;
  } catch {
    return DEFAULT_PRODUCT_TYPES;
  }
}

// Helper to merge default and custom colors
function mergeColors(defaultColors, customColors) {
  const colorMap = new Map();

  // Add defaults first
  defaultColors.forEach(c => colorMap.set(c.id, c));

  // Add/override with custom colors
  customColors.forEach(c => colorMap.set(c.id, c));

  return Array.from(colorMap.values());
}

// Export PRODUCT_TYPES that reads from localStorage
// Note: This is a getter function, not a static object
export const PRODUCT_TYPES = new Proxy(DEFAULT_PRODUCT_TYPES, {
  get(target, prop) {
    // For direct property access, return the merged version
    if (prop === 'tshirt' || prop === 'hoodie' || prop === 'oversized' || prop === 'kids') {
      const types = getProductTypes();
      return types[prop] || target[prop];
    }
    // For Object.keys, Object.values, etc.
    if (prop === 'keys' || prop === 'values' || prop === 'entries' || prop === Symbol.iterator) {
      return Object[prop](getProductTypes());
    }
    return target[prop];
  },
  ownKeys() {
    return Object.keys(getProductTypes());
  },
  getOwnPropertyDescriptor(target, prop) {
    const types = getProductTypes();
    if (types[prop]) {
      return { configurable: true, enumerable: true, value: types[prop], writable: false };
    }
    return Object.getOwnPropertyDescriptor(target, prop);
  }
});

export const DEFAULT_PREFERENCES = {
  productType: "tshirt",
  designType: "single",
  selectedColor: "white",
  color: "white"
};

export const STORAGE_KEY = "designPreferences";

export function getProductTypeConfig(productTypeId) {
  return PRODUCT_TYPES[productTypeId] || PRODUCT_TYPES.tshirt;
}

export function getColorsForProductType(productTypeId) {
  return getProductTypeConfig(productTypeId).colors;
}

export function isColorValidForProduct(productTypeId, colorId) {
  return getColorsForProductType(productTypeId).some(
    (color) => color.id === colorId
  );
}

export function getDefaultColorForProduct(productTypeId) {
  return getColorsForProductType(productTypeId)[0]?.id || "white";
}

export function normalizePreferences(preferences = {}) {
  const productType = PRODUCT_TYPES[preferences.productType]
    ? preferences.productType
    : DEFAULT_PREFERENCES.productType;

  const designType = DESIGN_TYPES[preferences.designType]
    ? preferences.designType
    : DEFAULT_PREFERENCES.designType;

  const requestedColor =
    preferences.selectedColor || preferences.color;

  const selectedColor = isColorValidForProduct(
    productType,
    requestedColor
  )
    ? requestedColor
    : getDefaultColorForProduct(productType);

  return {
    productType,
    designType,
    selectedColor,
    color: selectedColor
  };
}

export function getPreferenceLabels(preferences) {
  const product = getProductTypeConfig(preferences.productType);
  const design = DESIGN_TYPES[preferences.designType];
  const colorId =
    preferences.selectedColor || preferences.color;
  const color = product.colors.find((c) => c.id === colorId);

  return {
    productType: product.label,
    designType: design.label,
    color: color?.label || colorId
  };
}
