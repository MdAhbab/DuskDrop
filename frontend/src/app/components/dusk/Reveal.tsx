import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle scroll-reveal. Used sparingly — most motion here is scrubbed to scroll. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--amber)]">
      <span className="h-px w-6 bg-[var(--amber)]/60" />
      {children}
    </span>
  );
}
