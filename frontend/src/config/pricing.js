// Frontend Pricing Config - Mirrors backend config/pricing.js
// Prices are in INR (₹). Default 0 - editable from Admin Panel
// This is a static copy; in production you may want to fetch from backend

export const PRICING_KEYS = {
  // A4 Single Side
  "a4-tshirt-single": { productType: "tshirt", printSize: "A4", sides: "single", label: "A4 Design Front Or Back T-Shirt" },
  "a4-hoodie-single": { productType: "hoodie", printSize: "A4", sides: "single", label: "A4 Design Front or Back Hoodie" },
  "a4-oversized-single": { productType: "oversized", printSize: "A4", sides: "single", label: "A4 Design Front Or Back Oversized T-Shirt" },
  "a4-kids-single": { productType: "kids", printSize: "A4", sides: "single", label: "A4 Design Front or Back Kids T-Shirt" },

  // A3 Single Side
  "a3-tshirt-single": { productType: "tshirt", printSize: "A3", sides: "single", label: "A3 Design Front or Back T-Shirt" },
  "a3-hoodie-single": { productType: "hoodie", printSize: "A3", sides: "single", label: "A3 Design Back (front Not possible) Hoodie" },
  "a3-oversized-single": { productType: "oversized", printSize: "A3", sides: "single", label: "A3 Design front/back Oversized Tshirt" },

  // A4 Double Side
  "a4-tshirt-double": { productType: "tshirt", printSize: "A4", sides: "double", label: "Small + A4 Design Front and Back T-Shirt" },
  "a4-hoodie-double": { productType: "hoodie", printSize: "A4", sides: "double", label: "Small + A4 Design front and Back Hoodie" },
  "a4-oversized-double": { productType: "oversized", printSize: "A4", sides: "double", label: "Small + A4 Design front and Back Oversized T-Shirt" },
  "a4-kids-double": { productType: "kids", printSize: "A4", sides: "double", label: "Small + A4 Design Front and back Kids T-shirt" },

  // A3 & A4 Double Side (Couple)
  "a3a4-tshirt-double": { productType: "tshirt", printSize: "A3+A4", sides: "double", label: "A3 & A4 Design Front and back T-Shirt" },
  "a3a4-hoodie-double": { productType: "hoodie", printSize: "A3+A4", sides: "double", label: "A3 & A4 Design Front and Back Hoodie" },
  "a3a4-oversized-double": { productType: "oversized", printSize: "A3+A4", sides: "double", label: "A3 & A4 Design front and back Oversized T-shirt" },
};

/**
 * Get the correct pricing key based on product type and design type
 * @param {string} productType - "tshirt" | "hoodie" | "oversized" | "kids"
 * @param {string} designType - "single" | "double" | "couple"
 * @returns {string} pricing key
 */
export function getPricingKey(productType, designType) {
  // Map design types to print size prefixes
  const prefixMap = {
    single: "a4",        // Single design uses A4
    double: "a4",        // Double side uses A4 (front + back)
    couple: "a3a4",      // Couple uses A3+A4 double side
  };

  const prefix = prefixMap[designType] || "a4";

  // Kids only supports single (per DesignPreferences.jsx)
  if (productType === "kids" && designType !== "single") {
    console.warn(`Kids product type only supports single design, falling back to single`);
    return `a4-kids-single`;
  }

  // Couple not available for kids
  if (productType === "kids" && designType === "couple") {
    console.warn(`Couple design not available for kids, falling back to single`);
    return `a4-kids-single`;
  }

  return `${prefix}-${productType}-${designType === "couple" ? "double" : designType}`;
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