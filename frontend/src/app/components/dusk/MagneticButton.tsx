import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type ReactNode, type MouseEvent } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "ember" | "ghost" | "outline";
  type?: "button" | "submit";
  strength?: number;
}

/** A button with subtle magnetic inertial pull toward the cursor. (README §2.6) */
export function MagneticButton({
  children,
  onClick,
  className = "",
  variant = "ember",
  type = "button",
  strength = 0.4,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function move(e: MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
  }

  const variants: Record<string, string> = {
    ember:
      "bg-[var(--ember)] text-[var(--primary-foreground)] shadow-ember hover:brightness-105",
    outline:
      "border border-[var(--ink-dim)]/40 text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
    ghost: "text-[var(--ink)] hover:bg-[var(--accent)]",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.3 }}
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 ease-dusk transition-[filter,colors] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
