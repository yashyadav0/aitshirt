// Pricing Variables - Print-Side Based Pricing
// Prices are in INR (₹). Default 0 - editable from Admin Panel

const PRICING = {
  // =====================================
  // T-SHIRT (Standard)
  // =====================================
  "tshirt-front": {
    key: "tshirt-front",
    label: "T-Shirt - Front Only",
    productType: "tshirt",
    printSide: "front",
    price: 0
  },
  "tshirt-back": {
    key: "tshirt-back",
    label: "T-Shirt - Back Only",
    productType: "tshirt",
    printSide: "back",
    price: 0
  },
  "tshirt-both": {
    key: "tshirt-both",
    label: "T-Shirt - Front & Back",
    productType: "tshirt",
    printSide: "both",
    price: 0
  },

  // =====================================
  // OVERSIZED T-SHIRT
  // =====================================
  "oversized-front": {
    key: "oversized-front",
    label: "Oversized T-Shirt - Front Only",
    productType: "oversized",
    printSide: "front",
    price: 0
  },
  "oversized-back": {
    key: "oversized-back",
    label: "Oversized T-Shirt - Back Only",
    productType: "oversized",
    printSide: "back",
    price: 0
  },
  "oversized-both": {
    key: "oversized-both",
    label: "Oversized T-Shirt - Front & Back",
    productType: "oversized",
    printSide: "both",
    price: 0
  },

  // =====================================
  // KIDS T-SHIRT
  // =====================================
  "kids-front": {
    key: "kids-front",
    label: "Kids T-Shirt - Front Only",
    productType: "kids",
    printSide: "front",
    price: 0
  },
  "kids-back": {
    key: "kids-back",
    label: "Kids T-Shirt - Back Only",
    productType: "kids",
    printSide: "back",
    price: 0
  },
  "kids-both": {
    key: "kids-both",
    label: "Kids T-Shirt - Front & Back",
    productType: "kids",
    printSide: "both",
    price: 0
  },

  // =====================================
  // HOODIE
  // =====================================
  "hoodie-front": {
    key: "hoodie-front",
    label: "Hoodie - Front Only",
    productType: "hoodie",
    printSide: "front",
    price: 0
  },
  "hoodie-back": {
    key: "hoodie-back",
    label: "Hoodie - Back Only",
    productType: "hoodie",
    printSide: "back",
    price: 0
  },
  "hoodie-both": {
    key: "hoodie-both",
    label: "Hoodie - Front & Back",
    productType: "hoodie",
    printSide: "both",
    price: 0
  },

  // =====================================
  // COUPLE DESIGNS (Unified Front Pricing)
  // =====================================
  "couple-tshirt": {
    key: "couple-tshirt",
    label: "Couple Design - T-Shirt (Front)",
    productType: "tshirt",
    printSide: "couple",
    price: 0
  },
  "couple-oversized": {
    key: "couple-oversized",
    label: "Couple Design - Oversized (Front)",
    productType: "oversized",
    printSide: "couple",
    price: 0
  },
  "couple-hoodie": {
    key: "couple-hoodie",
    label: "Couple Design - Hoodie (Front)",
    productType: "hoodie",
    printSide: "couple",
    price: 0
  }
};

// Helper functions
function getAllPricing() {
  return Object.values(PRICING);
}

function getPricingByKey(key) {
  return PRICING[key] || null;
}

function getPricingByProductType(productType) {
  return Object.values(PRICING).filter(p => p.productType === productType);
}

function getPricingByPrintSide(printSide) {
  return Object.values(PRICING).filter(p => p.printSide === printSide);
}

function updatePrice(key, price) {
  if (PRICING[key]) {
    PRICING[key].price = Number(price) || 0;
    return PRICING[key];
  }
  return null;
}

function getDefaultPrice(key) {
  const item = PRICING[key];
  return item ? item.price : 0;
}

// Generate price map for easy lookup in cart/order
function getPriceMap() {
  const map = {};
  Object.entries(PRICING).forEach(([key, item]) => {
    map[key] = item.price;
  });
  return map;
}

// Get pricing key based on product type, print side, and design type
function getPricingKey(productType, designType, printSide) {
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

module.exports = {
  PRICING,
  getAllPricing,
  getPricingByKey,
  getPricingByProductType,
  getPricingByPrintSide,
  updatePrice,
  getDefaultPrice,
  getPriceMap,
  getPricingKey
};