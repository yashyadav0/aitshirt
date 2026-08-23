import { getQuotaSummary } from "../../utils/quota";

export default function UsageIndicator({ user }) {
  if (!user) return null;

  const quota = getQuotaSummary(user);
  if (!quota) return null;

  const { tier, weeklyPromptsLeft, weeklyLimit, extraPrompts, promptCreditBalance, isUnlimited } = quota;

  if (isUnlimited) {
    return (
      <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium border border-cyan-500/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        Unlimited
      </span>
    );
  }

  const totalAvailable = weeklyPromptsLeft + extraPrompts + promptCreditBalance;

  let bgColor = "bg-zinc-800";
  let textColor = "text-zinc-300";
  let borderColor = "border-zinc-700";

  if (totalAvailable <= 0) {
    bgColor = "bg-red-500/20";
    textColor = "text-red-400";
    borderColor = "border-red-500/30";
  } else if (totalAvailable <= 3) {
    bgColor = "bg-yellow-500/20";
    textColor = "text-yellow-400";
    borderColor = "border-yellow-500/30";
  } else if (totalAvailable <= 10) {
    bgColor = "bg-cyan-500/20";
    textColor = "text-cyan-400";
    borderColor = "border-cyan-500/30";
  } else {
    bgColor = "bg-green-500/20";
    textColor = "text-green-400";
    borderColor = "border-green-500/30";
  }

  const tierLabels = {
    normal: "Normal",
    recurring: "Recurring",
    vip: "VIP",
    premium: "Premium"
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} ${textColor} ${borderColor} border text-sm font-medium`}>
      <span className="capitalize">{tierLabels[tier] || tier}</span>
      <span className="text-zinc-500">·</span>
      {isUnlimited ? (
        <span>Unlimited</span>
      ) : (
        <>
          <span>{weeklyPromptsLeft} / {weeklyLimit} weekly</span>
          {(extraPrompts > 0 || promptCreditBalance > 0) && (
            <>
              <span className="text-zinc-500">·</span>
              <span>+{extraPrompts} extra</span>
              {promptCreditBalance > 0 && (
                <>
                  <span className="text-zinc-500">·</span>
                  <span>+{promptCreditBalance} credits</span>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}