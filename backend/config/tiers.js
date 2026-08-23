const TIERS = {
  normal: {
    label: "Normal",
    weeklyLimit: 7
  },
  recurring: {
    label: "Recurring",
    weeklyLimit: 20
  },
  vip: {
    label: "VIP",
    weeklyLimit: 100
  }
};

const DEFAULT_TIER = "normal";

function getTierConfig(tier) {
  return TIERS[tier] || TIERS[DEFAULT_TIER];
}

function isUnlimited(tier) {
  const config = getTierConfig(tier);
  return config.weeklyLimit === Infinity;
}

module.exports = {
  TIERS,
  DEFAULT_TIER,
  getTierConfig,
  isUnlimited
};