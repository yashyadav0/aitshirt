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
  },
  oversized: {
    label: "oversized t-shirt",
    pluralLabel: "oversized t-shirts",
    colors: ["white", "black", "red"]
  },
  kids: {
    label: "kids t-shirt",
    pluralLabel: "kids t-shirts",
    colors: ["white", "black", "red"]
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
      `Create a coordinated split-panel apparel design featuring ${trimmedPrompt}.`,
      `Optimized for one ${colorLabel} ${product.label}.`,
      "Two complementary graphic halves that share a theme but have distinct layouts.",
      "Transparent background.",
      "Professional apparel print style.",
      "No text, words, or labels in the artwork."
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


// Style chips from the Gemini-style workspace UI. Whitelisted so the client
// can never inject arbitrary instructions through the "styles" field.
const STYLE_DIRECTIVES = {
  graphic: "bold illustrated graphic artwork with strong imagery and a clear focal subject",
  text: "typography-led design with premium, highly legible lettering as the hero element",
  aesthetic: "trendy aesthetic streetwear look, curated colour palette, modern fashion mood",
  minimal: "minimal clean design, generous negative space, restrained palette, simple shapes"
};

function parseStyles(raw) {
  let list = raw;
  if (typeof raw === "string") {
    try { list = JSON.parse(raw); } catch { list = []; }
  }
  if (!Array.isArray(list)) return [];
  return [...new Set(list.map((s) => String(s).toLowerCase()))]
    .filter((s) => STYLE_DIRECTIVES[s]);
}

function applyStylesToPrompt(userPrompt, styles = []) {
  const base = String(userPrompt || "").trim();
  if (!styles.length) return base;
  return `${base}. Style direction: ${styles.map((s) => STYLE_DIRECTIVES[s]).join("; ")}.`;
}

module.exports = {
  DEFAULT_PREFERENCES,
  buildPreferenceEnrichedPrompt,
  getColorLabel,
  getProductLabels,
  normalizePreferences,
  parseStyles,
  applyStylesToPrompt
};
