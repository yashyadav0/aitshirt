const { getTierConfig } = require("../config/tiers");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function resetIfNeeded(user) {
  const now = Date.now();
  const lastReset = user.lastPromptReset ? new Date(user.lastPromptReset).getTime() : 0;

  if (now - lastReset >= WEEK_MS) {
    user.weeklyPromptsLeft = user.weeklyLimit || getTierConfig(user.tier).weeklyLimit;
    user.lastPromptReset = new Date();
    await user.save();
  }
}

function hasQuota(user) {
  // No unlimited tier - VIP is 100/week max
  return (
    (user.weeklyPromptsLeft || 0) > 0 ||
    (user.extraPrompts || 0) > 0 ||
    (user.promptCreditBalance || 0) > 0
  );
}

async function consumeQuota(user) {
  // No unlimited tier - VIP is 100/week max
  if ((user.weeklyPromptsLeft || 0) > 0) {
    user.weeklyPromptsLeft -= 1;
  } else if ((user.extraPrompts || 0) > 0) {
    user.extraPrompts -= 1;
  } else if ((user.promptCreditBalance || 0) > 0) {
    user.promptCreditBalance -= 1;
  } else {
    return false;
  }

  await user.save();
  return true;
}

function getQuotaSummary(user) {
  return {
    tier: user.tier || "normal",
    weeklyLimit: user.weeklyLimit || getTierConfig(user.tier).weeklyLimit,
    weeklyPromptsLeft: user.weeklyPromptsLeft || 0,
    extraPrompts: user.extraPrompts || 0,
    promptCreditBalance: user.promptCreditBalance || 0,
    isUnlimited: false
  };
}

module.exports = {
  resetIfNeeded,
  hasQuota,
  consumeQuota,
  getQuotaSummary,
  WEEK_MS
};