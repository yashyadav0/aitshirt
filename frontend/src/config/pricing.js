// Frontend Pricing Config - Mirrors backend config/pricing.js
// Prices are in INR (₹). Default 0 - editable from Admin Panel
// This is a static copy; in production you may want to fetch from backend

export const PRICING_KEYS = {
  // T-Shirt
  "tshirt-front": { productType: "tshirt", printSide: "front", label: "T-Shirt - Front Only" },
  "tshirt-back": { productType: "tshirt", printSide: "back", label: "T-Shirt - Back Only" },
  "tshirt-both": { productType: "tshirt", printSide: "both", label: "T-Shirt - Front & Back" },

  // Oversized
  "oversized-front": { productType: "oversized", printSide: "front", label: "Oversized T-Shirt - Front Only" },
  "oversized-back": { productType: "oversized", printSide: "back", label: "Oversized T-Shirt - Back Only" },
  "oversized-both": { productType: "oversized", printSide: "both", label: "Oversized T-Shirt - Front & Back" },

  // Kids
  "kids-front": { productType: "kids", printSide: "front", label: "Kids T-Shirt - Front Only" },
  "kids-back": { productType: "kids", printSide: "back", label: "Kids T-Shirt - Back Only" },
  "kids-both": { productType: "kids", printSide: "both", label: "Kids T-Shirt - Front & Back" },

  // Hoodie
  "hoodie-front": { productType: "hoodie", printSide: "front", label: "Hoodie - Front Only" },
  "hoodie-back": { productType: "hoodie", printSide: "back", label: "Hoodie - Back Only" },
  "hoodie-both": { productType: "hoodie", printSide: "both", label: "Hoodie - Front & Back" },

  // Couple Designs (Unified Front Pricing)
  "couple-tshirt": { productType: "tshirt", printSide: "couple", label: "Couple Design - T-Shirt (Front)" },
  "couple-oversized": { productType: "oversized", printSide: "couple", label: "Couple Design - Oversized (Front)" },
  "couple-hoodie": { productType: "hoodie", printSide: "couple", label: "Couple Design - Hoodie (Front)" },
  "couple-kids": { productType: "kids", printSide: "couple", label: "Couple Design - Kids (Front)" },
};

/**
 * Get the correct pricing key based on product type, design type, and print side
 * @param {string} productType - "tshirt" | "hoodie" | "oversized" | "kids"
 * @param {string} designType - "single" | "double" | "couple"
 * @param {string} printSide - "front" | "back" | "both" (for single/double designs)
 * @returns {string} pricing key
 */
export function getPricingKey(productType, designType, printSide) {
  // Couple designs always use couple pricing (unified front)
  if (designType === "couple") {
    return `couple-${productType}`;
  }

  // For single/double designs, use printSide (front, back, both)
  const sideMap = {
    "front": "front",
    "back": "back",
    "both": "both",
    "single": "front",  // Default single to front
    "double": "both"    // Default double to both
  };
  const side = sideMap[printSide] || sideMap[designType] || "front";
  return `${productType}-${side}`;
}

/**
 * Get pricing info by key
 * @param {string} key
 * @returns {object|null}
 */
export function getPricingByKey(key) {
  return PRICING_KEYS[key] || null;
}

/**
 * Get all pricing for a product type
 * @param {string} productType
 * @returns {array}
 */
export function getPricingByProductType(productType) {
  return Object.entries(PRICING_KEYS)
    .filter(([, value]) => value.productType === productType)
    .map(([key, value]) => ({ key, ...value }));
}