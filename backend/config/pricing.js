// Pricing Variables - All 14 Design Options
// Prices are in INR (₹). Default 0 - editable from Admin Panel

const PRICING = {
  // =====================================
  // A4 SINGLE SIDE (Front OR Back)
  // =====================================
  "a4-tshirt-single": {
    key: "a4-tshirt-single",
    label: "A4 Design Front Or Back T-Shirt",
    productType: "tshirt",
    printSize: "A4",
    sides: "single",
    price: 0
  },
  "a4-hoodie-single": {
    key: "a4-hoodie-single",
    label: "A4 Design Front or Back Hoodie",
    productType: "hoodie",
    printSize: "A4",
    sides: "single",
    price: 0
  },
  "a4-oversized-single": {
    key: "a4-oversized-single",
    label: "A4 Design Front Or Back Oversized T-Shirt",
    productType: "oversized",
    printSize: "A4",
    sides: "single",
    price: 0
  },
  "a4-kids-single": {
    key: "a4-kids-single",
    label: "A4 Design Front or Back Kids T-Shirt",
    productType: "kids",
    printSize: "A4",
    sides: "single",
    price: 0
  },

  // =====================================
  // A3 SINGLE SIDE (Front OR Back for T-Shirt/Oversized, Back only for Hoodie)
  // =====================================
  "a3-tshirt-single": {
    key: "a3-tshirt-single",
    label: "A3 Design Front or Back T-Shirt",
    productType: "tshirt",
    printSize: "A3",
    sides: "single",
    price: 0
  },
  "a3-hoodie-single": {
    key: "a3-hoodie-single",
    label: "A3 Design Back (front Not possible) Hoodie",
    productType: "hoodie",
    printSize: "A3",
    sides: "single",
    price: 0
  },
  "a3-oversized-single": {
    key: "a3-oversized-single",
    label: "A3 Design front/back Oversized Tshirt",
    productType: "oversized",
    printSize: "A3",
    sides: "single",
    price: 0
  },

  // =====================================
  // A4 DOUBLE SIDE (Front AND Back)
  // =====================================
  "a4-tshirt-double": {
    key: "a4-tshirt-double",
    label: "Small + A4 Design Front and Back T-Shirt",
    productType: "tshirt",
    printSize: "A4",
    sides: "double",
    price: 0
  },
  "a4-hoodie-double": {
    key: "a4-hoodie-double",
    label: "Small + A4 Design front and Back Hoodie",
    productType: "hoodie",
    printSize: "A4",
    sides: "double",
    price: 0
  },
  "a4-oversized-double": {
    key: "a4-oversized-double",
    label: "Small + A4 Design front and Back Oversized T-Shirt",
    productType: "oversized",
    printSize: "A4",
    sides: "double",
    price: 0
  },
  "a4-kids-double": {
    key: "a4-kids-double",
    label: "Small + A4 Design Front and back Kids T-shirt",
    productType: "kids",
    printSize: "A4",
    sides: "double",
    price: 0
  },

  // =====================================
  // A3 & A4 DOUBLE SIDE (Front AND Back)
  // =====================================
  "a3a4-tshirt-double": {
    key: "a3a4-tshirt-double",
    label: "A3 & A4 Design Front and back T-Shirt",
    productType: "tshirt",
    printSize: "A3+A4",
    sides: "double",
    price: 0
  },
  "a3a4-hoodie-double": {
    key: "a3a4-hoodie-double",
    label: "A3 & A4 Design Front and Back Hoodie",
    productType: "hoodie",
    printSize: "A3+A4",
    sides: "double",
    price: 0
  },
  "a3a4-oversized-double": {
    key: "a3a4-oversized-double",
    label: "A3 & A4 Design front and back Oversized T-shirt",
    productType: "oversized",
    printSize: "A3+A4",
    sides: "double",
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

function getPricingByPrintSize(printSize) {
  return Object.values(PRICING).filter(p => p.printSize === printSize);
}

function getPricingBySides(sides) {
  return Object.values(PRICING).filter(p => p.sides === sides);
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

module.exports = {
  PRICING,
  getAllPricing,
  getPricingByKey,
  getPricingByProductType,
  getPricingByPrintSize,
  getPricingBySides,
  updatePrice,
  getDefaultPrice,
  getPriceMap
};