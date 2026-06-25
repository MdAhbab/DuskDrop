import { motion } from "motion/react";
import { useTheme } from "../../lib/theme";

/**
 * ThemeToggle — a small sun/moon riding a horizon line. Sliding it re-runs the
 * dusk gradient at a different point in its arc. (README §1)
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to afternoon (light) theme" : "Switch to dusk (dark) theme"}
      title={isDark ? "Golden afternoon" : "Late dusk"}
      className="group relative h-9 w-16 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-elev)] ease-dusk transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
    >
      {/* horizon line */}
      <span className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-[var(--ink-dim)]/40" />
      <motion.span
        className="absolute top-1/2 size-7 -translate-y-1/2 rounded-full"
        initial={false}
        animate={{
          left: isDark ? 4 : 32,
          background: isDark
            ? "radial-gradient(circle at 35% 35%, #fff7e8, #f4c95d 60%, #d99a3a)"
            : "radial-gradient(circle at 35% 35%, #fffdf5, #e7c79a 55%, #c99528)",
          boxShadow: isDark ? "0 0 14px 2px rgba(244,201,93,0.7)" : "0 0 12px 1px rgba(232,155,46,0.6)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {/* crescent shadow turns the sun into a moon in dark mode */}
        <motion.span
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{ opacity: isDark ? 1 : 0, x: isDark ? 5 : 0 }}
          style={{ background: "var(--bg-elev)" }}
        />
      </motion.span>
    </button>
  );
}
