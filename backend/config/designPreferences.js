const PRODUCT_TYPES = {
  tshirt: {
    label: "t-shirt",
    pluralLabel: "t-shirts",
    colors: ["white", "black", "red"]
  },
  hoodie: {
    label: "hoodie",
    pluralLabel: "hoodies",
    colors: ["black", "white", "blue"]
  }
};

const COLOR_LABELS = {
  white: "white",
  black: "black",
  red: "red",
  blue: "navy blue"
};

const DESIGN_TYPES = {
  single: true,
  double: true,
  couple: true
};

const DEFAULT_PREFERENCES = {
  productType: "tshirt",
  designType: "single",
  selectedColor: "white",
  color: "white"
};

function getColorLabel(color) {
  return COLOR_LABELS[color] || color;
}

function getProductLabels(productType) {
  return PRODUCT_TYPES[productType] || PRODUCT_TYPES.tshirt;
}

function getDefaultColorForProduct(productType) {
  return getProductLabels(productType).colors[0] || DEFAULT_PREFERENCES.color;
}

function normalizePreferences(preferences = {}) {
  const productType = PRODUCT_TYPES[preferences.productType]
    ? preferences.productType
    : DEFAULT_PREFERENCES.productType;

  const designType = DESIGN_TYPES[preferences.designType]
    ? preferences.designType
    : DEFAULT_PREFERENCES.designType;

  const requestedColor =
    preferences.selectedColor || preferences.color;

  const productColors = getProductLabels(productType).colors;
  const selectedColor = productColors.includes(requestedColor)
    ? requestedColor
    : getDefaultColorForProduct(productType);

  return {
    productType,
    designType,
    selectedColor,
    color: selectedColor
  };
}

function buildPreferenceEnrichedPrompt(
  userPrompt,
  preferences = {}
) {
  const normalizedPreferences =
    normalizePreferences(preferences);

  const {
    productType,
    designType,
    selectedColor
  } = normalizedPreferences;

  const product = getProductLabels(productType);
  const colorLabel = getColorLabel(selectedColor);
  const trimmedPrompt = String(userPrompt || "").trim();

  if (designType === "couple") {
    return [
      `Create two matching apparel designs for couples featuring ${trimmedPrompt}.`,
      `Optimized for ${colorLabel} ${product.pluralLabel}.`,
      "Designs should complement each other while remaining unique.",
      "Transparent background.",
      "Professional apparel print style."
    ].join(" ");
  }

  if (designType === "double") {
    return [
      `Create a high-quality print-ready apparel graphic featuring ${trimmedPrompt}.`,
      `Optimized for a ${colorLabel} ${product.label}.`,
      "Create one independent large centered apparel graphic.",
      "Transparent background.",
      "Professional DTG print style.",
      "Oversized centered print placement, never a small chest logo."
    ].join(" ");
  }

  return [
    `Create a high-quality print-ready t-shirt graphic featuring ${trimmedPrompt}.`,
    `Optimized for a ${colorLabel} ${product.label}.`,
    "Single apparel design.",
    "Transparent background.",
    "Professional DTG print style.",
    "Center chest placement."
  ].join(" ");
}

module.exports = {
  DEFAULT_PREFERENCES,
  buildPreferenceEnrichedPrompt,
  getColorLabel,
  getProductLabels,
  normalizePreferences
};
