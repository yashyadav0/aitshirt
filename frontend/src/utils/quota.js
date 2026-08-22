export function hasQuota(user) {
  if (!user) return false;

  // No unlimited tier anymore (VIP = 100/week)
  const weeklyLeft = user.weeklyPromptsLeft || 0;
  const extra = user.extraPrompts || 0;
  const credits = user.promptCreditBalance || 0;

  return weeklyLeft > 0 || extra > 0 || credits > 0;
}

export function getQuotaSummary(user) {
  if (!user) return null;

  // No unlimited tier - VIP is 100/week max
  return {
    tier: user.tier || "normal",
    weeklyLimit: user.weeklyLimit || 7,
    weeklyPromptsLeft: user.weeklyPromptsLeft || 0,
    extraPrompts: user.extraPrompts || 0,
    promptCreditBalance: user.promptCreditBalance || 0,
    isUnlimited: false
  };
}