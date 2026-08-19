import {
  isUnlimitedTier,
  getUsageLabel
} from "../../utils/quota";

const TIER_STYLES = {
  free: "bg-zinc-800 text-zinc-300 border-zinc-700",
  pro: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  premium: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40"
};

const TIER_LABELS = {
  free: "Free",
  pro: "Pro",
  premium: "Premium"
};

export default function UsageIndicator({
  user
}) {

  if (!user) return null;

  const tier =
    user.tier || "free";

  const unlimited =
    isUnlimitedTier(tier);

  const style =
    TIER_STYLES[tier] || TIER_STYLES.free;

  const extra =
    (user.extraPrompts || 0) +
    (user.promptCreditBalance || 0);

  return (

    <div
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-medium
        ${style}
      `}
    >

      <span
        className="
          uppercase
          tracking-wide
        "
      >
        {TIER_LABELS[tier] || tier}
      </span>

      <span
        className="
          text-zinc-500
        "
      >
        •
      </span>

      <span>
        {getUsageLabel(user)}
      </span>

      {
        !unlimited && extra > 0 && (
          <span
            className="
              text-zinc-500
            "
          >
            +{extra} credits
          </span>
        )
      }

    </div>
  );
}
