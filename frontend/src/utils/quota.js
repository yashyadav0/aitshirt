export function isUnlimitedTier(tier) {
  return tier === "premium";
}

export function hasQuota(user) {
  if (!user) return true;
  if (isUnlimitedTier(user.tier)) return true;

  return (
    (user.weeklyPromptsLeft || 0) > 0 ||
    (user.extraPrompts || 0) > 0 ||
    (user.promptCreditBalance || 0) > 0
  );
}

export function getUsageLabel(user) {
  if (!user) return "";
  if (isUnlimitedTier(user.tier)) return "Unlimited";
  const left = user.weeklyPromptsLeft || 0;
  const limit = user.weeklyLimit || 5;
  return `${left}/${limit} left`;
}
