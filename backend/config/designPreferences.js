const PRODUCT_TYPES = {
  tshirt: {
    label: "t-shirt",
    pluralLabel: "t-shirts"
  },
  hoodie: {
    label: "hoodie",
    pluralLabel: "hoodies"
  }
};

const COLOR_LABELS = {
  white: "white",
  black: "black",
  red: "red",
  blue: "navy blue"
};

function getColorLabel(color) {
  return COLOR_LABELS[color] || color;
}

function getProductLabels(productType) {
  return PRODUCT_TYPES[productType] || PRODUCT_TYPES.tshirt;
}

function buildPreferenceEnrichedPrompt(
  userPrompt,
  preferences = {}
) {
  const {
    productType = "tshirt",
    designType = "single",
    color = "white"
  } = preferences;

  const product = getProductLabels(productType);
  const colorLabel = getColorLabel(color);
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

  return [
    `Create a high-quality print-ready apparel graphic featuring ${trimmedPrompt}.`,
    `Optimized for a ${colorLabel} ${product.label}.`,
    "Single apparel design.",
    "Transparent background.",
    "Professional DTG print style.",
    "Center chest placement."
  ].join(" ");
}

module.exports = {
  buildPreferenceEnrichedPrompt,
  getColorLabel,
  getProductLabels
};
