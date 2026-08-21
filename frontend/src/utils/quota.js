export function hasQuota(user) {
  if (!user) return false;

  // Admin/unlimited tier
  if (user.tier === "premium" || user.weeklyLimit === Infinity) return true;

  const weeklyLeft = user.weeklyPromptsLeft || 0;
  const extra = user.extraPrompts || 0;
  const credits = user.promptCreditBalance || 0;

  return weeklyLeft > 0 || extra > 0 || credits > 0;
}

export function getQuotaSummary(user) {
  if (!user) return null;

  const isUnlimited = user.tier === "premium" || user.weeklyLimit === Infinity;

  return {
    tier: user.tier || "free",
    weeklyLimit: isUnlimited ? Infinity : (user.weeklyLimit || 5),
    weeklyPromptsLeft: user.weeklyPromptsLeft || 0,
    extraPrompts: user.extraPrompts || 0,
    promptCreditBalance: user.promptCreditBalance || 0,
    isUnlimited
  };
}