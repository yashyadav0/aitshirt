// =====================================
// PRODUCT MOCKUP CONFIG
// =====================================
// Centralizes the static template imports that previously lived inline in
// AIWorkspace.jsx, and layers a localStorage override map on top so admins
// can swap / add mockups from the UI without code changes or redeploys.
//
// Reads are OVERRIDE-FIRST: if an admin has set a mockup for a given
// (productType, color, side) slot, that URL wins. Otherwise we fall back to
// the shipped static asset. With an empty override map the behaviour is
// identical to the original hardcoded implementation.

// ===== FRONT =====

import blackFront from "../templates/tshirts/black/front.png";
import whiteFront from "../templates/tshirts/white/front.png";
import redFront from "../templates/tshirts/red/front.png";

import hoodieBlackFront from "../templates/hoodies/black/front.png";
import hoodieWhiteFront from "../templates/hoodies/white/front.png";
import hoodieBlueFront from "../templates/hoodies/blue/front.png";

import oversizedBlackFront from "../templates/oversized/black/front.png";
import oversizedWhiteFront from "../templates/oversized/white/front.png";
import oversizedRedFront from "../templates/oversized/red/front.png";

import kidsBlackFront from "../templates/kids/black/front.png";
import kidsWhiteFront from "../templates/kids/white/front.png";
import kidsRedFront from "../templates/kids/red/front.png";

// ===== BACK =====

import blackBack from "../templates/tshirts/black/back.png";
import whiteBack from "../templates/tshirts/white/back.png";
import redBack from "../templates/tshirts/red/back.png";

import hoodieBlackBack from "../templates/hoodies/black/back.png";
import hoodieWhiteBack from "../templates/hoodies/white/back.png";
import hoodieBlueBack from "../templates/hoodies/blue/back.png";

import oversizedBlackBack from "../templates/oversized/black/back.png";
import oversizedWhiteBack from "../templates/oversized/white/back.png";
import oversizedRedBack from "../templates/oversized/red/back.png";

import kidsBlackBack from "../templates/kids/black/back.png";
import kidsWhiteBack from "../templates/kids/white/back.png";
import kidsRedBack from "../templates/kids/red/back.png";

import { PRODUCT_TYPES } from "./designPreferences";

// =====================================
// STATIC MAP
// =====================================

const tshirts = {
  white: { front: whiteFront, back: whiteBack },
  black: { front: blackFront, back: blackBack },
  red: { front: redFront, back: redBack }
};

const hoodies = {
  black: { front: hoodieBlackFront, back: hoodieBlackBack },
  white: { front: hoodieWhiteFront, back: hoodieWhiteBack },
  blue: { front: hoodieBlueFront, back: hoodieBlueBack }
};

const oversized = {
  white: { front: oversizedWhiteFront, back: oversizedWhiteBack },
  black: { front: oversizedBlackFront, back: oversizedBlackBack },
  red: { front: oversizedRedFront, back: oversizedRedBack }
};

const kids = {
  white: { front: kidsWhiteFront, back: kidsWhiteBack },
  black: { front: kidsBlackFront, back: kidsBlackBack },
  red: { front: kidsRedFront, back: kidsRedBack }
};

const mockupMap = {
  tshirt: tshirts,
  hoodie: hoodies,
  oversized: oversized,
  kids: kids
};

// =====================================
// OVERRIDE LAYER (localStorage)
// =====================================

export const MOCKUP_OVERRIDE_KEY = "mockupOverrides";

function slotKey(productType, color, side) {
  return `${productType}:${color}:${side}`;
}

function readOverrides() {
  try {
    const raw = localStorage.getItem(MOCKUP_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map) {
  try {
    localStorage.setItem(MOCKUP_OVERRIDE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / unavailable storage — fall back to static silently.
  }
}

// =====================================
// PUBLIC API
// =====================================

export function getOverride(productType, color, side) {
  const map = readOverrides();
  return map[slotKey(productType, color, side)] || null;
}

export function setOverride(productType, color, side, url) {
  const map = readOverrides();
  map[slotKey(productType, color, side)] = url;
  writeOverrides(map);
}

export function removeOverride(productType, color, side) {
  const map = readOverrides();
  delete map[slotKey(productType, color, side)];
  writeOverrides(map);
}

export function listOverrides() {
  const map = readOverrides();
  return Object.entries(map).map(([key, url]) => {
    const [productType, color, side] = key.split(":");
    return { productType, color, side, url };
  });
}

// Override-first mockup lookup. Falls back to the static import — identical
// output to the original AIWorkspace.getMockup when no override is set.
export function getMockup(productType, color, side) {
  const override = getOverride(productType, color, side);
  if (override) return override;

  const mockups = mockupMap[productType] || tshirts;
  const productMockups = mockups[color] || mockups.white;
  return productMockups[side] || productMockups.front;
}

// Enumerate every (productType, color, side) slot for the admin UI, including
// slots with no static asset yet (so admins can add brand-new variants).
export function listMockupSlots() {
  const slots = [];
  Object.values(PRODUCT_TYPES).forEach((product) => {
    product.colors.forEach((color) => {
      ["front", "back"].forEach((side) => {
        slots.push({
          productType: product.id,
          color: color.id,
          colorLabel: color.label,
          productLabel: product.label,
          side,
          hasStatic: Boolean(
            (mockupMap[product.id]?.[color.id] || {})?.[side]
          )
        });
      });
    });
  });
  return slots;
}
