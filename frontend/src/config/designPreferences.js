export const DESIGN_TYPES = {
  single: {
    id: "single",
    label: "Single Side",
    description: "One front design for one apparel item"
  },
  double: {
    id: "double",
    label: "Double Side",
    description: "Front and back designs for one apparel item"
  },
  couple: {
    id: "couple",
    label: "Couple Design",
    description: "Two matching designs as a pair"
  }
};

export const PRODUCT_TYPES = {
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
  }
};

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
