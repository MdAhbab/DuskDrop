import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { CURRENCY, currentPrice, discountPct } from "../../lib/data";
import * as api from "../../lib/api";
import { useClock } from "../../lib/theme";

interface Props {
  listing: api.Listing;
  size?: "sm" | "md" | "lg" | "xl";
  showOriginal?: boolean;
  showBadge?: boolean;
  className?: string;
}

const SIZES = {
  sm: "text-[1.05rem]",
  md: "text-[1.6rem]",
  lg: "text-[2.4rem]",
  xl: "text-[clamp(2.8rem,7vw,4.5rem)]",
};

/** Live price that decays in real time, rendered in tabular mono so digits
 *  don't jitter while ticking. (README §4 — TickingPrice) */
export function TickingPrice({ listing, size = "md", showOriginal = true, showBadge = true, className = "" }: Props) {
  useClock(1000); // re-render each second so the price keeps falling
  const price = currentPrice(listing);
  const pct = discountPct(listing);

  const mv = useMotionValue(price);
  const spring = useSpring(mv, { stiffness: 120, damping: 24 });
  const rounded = useTransform(spring, (v) => `${CURRENCY}${Math.round(v).toLocaleString("en-IN")}`);
  useEffect(() => {
    mv.set(price);
  }, [price, mv]);

  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <motion.span className={`tnum font-display font-semibold leading-none text-[var(--ink)] ${SIZES[size]}`}>
        {rounded}
      </motion.span>
      {showOriginal && (
        <span className="tnum text-[0.78em] text-[var(--ink-dim)] line-through opacity-70">
          {CURRENCY}
          {listing.original_price.toLocaleString("en-IN")}
        </span>
      )}
      {showBadge && pct > 0 && (
        <motion.span
          key={pct}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-[var(--amber)]/15 px-2 py-0.5 text-[0.7em] font-semibold text-[var(--amber)]"
        >
          −{pct}%
        </motion.span>
      )}
    </div>
  );
}
