// =====================================
// INVENTORY OVERRIDE STORE
// =====================================
// Lightweight, localStorage-backed stock overrides layered on top of the
// backend Product.variants stock values. Admins can adjust stock from the UI
// without any backend migration; effective stock = override ?? backend value.
//
// Key shape: `${productId}::${color}::${size}`

export const INVENTORY_OVERRIDE_KEY = "inventoryOverrides";

function variantKey(productId, color, size) {
  return `${productId}::${color}::${size}`;
}

function readOverrides() {
  try {
    const raw = localStorage.getItem(INVENTORY_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map) {
  try {
    localStorage.setItem(INVENTORY_OVERRIDE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / unavailable storage.
  }
}

// Returns the admin override quantity, or null when none is set (caller should
// fall back to the backend variant.stock).
export function getStock(productId, color, size) {
  const map = readOverrides();
  const value = map[variantKey(productId, color, size)];
  return value === undefined || value === null ? null : value;
}

// Effective stock = override (if set) else backend value.
export function getEffectiveStock(productId, color, size, backendStock) {
  const override = getStock(productId, color, size);
  return override === null ? backendStock : override;
}

export function setStock(productId, color, size, quantity) {
  const map = readOverrides();
  const qty = Math.max(0, Number(quantity) || 0);
  map[variantKey(productId, color, size)] = qty;
  writeOverrides(map);
}

export function removeStock(productId, color, size) {
  const map = readOverrides();
  delete map[variantKey(productId, color, size)];
  writeOverrides(map);
}

// Flat list of { productId, color, size, quantity } for admin summaries.
export function getAllOverrides() {
  const map = readOverrides();
  return Object.entries(map).map(([key, quantity]) => {
    const [productId, color, size] = key.split("::");
    return { productId, color, size, quantity };
  });
}
