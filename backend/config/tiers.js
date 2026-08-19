const TIERS = {
  free: {
    label: "Free",
    weeklyLimit: 5
  },
  pro: {
    label: "Pro",
    weeklyLimit: 50
  },
  premium: {
    label: "Premium",
    weeklyLimit: Infinity
  }
};

const DEFAULT_TIER = "free";

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