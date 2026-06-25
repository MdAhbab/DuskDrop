import { fmtCountdown } from "../../lib/data";

interface Props {
  remainingMs: number;
  totalMs: number;
  size?: number;
  stroke?: number;
  label?: string;
  showDigits?: boolean;
}

/** A circular ring that drains as a listing approaches close. (README §4) */
export function CountdownRing({
  remainingMs,
  totalMs,
  size = 120,
  stroke = 8,
  label,
  showDigits = true,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, Math.max(0, remainingMs / totalMs));
  const urgent = remainingMs < 10 * 60 * 1000; // < 10 min
  const color = urgent ? "var(--ember)" : "var(--amber)";

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`${label ?? "Closes in"} ${fmtCountdown(remainingMs)}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-dim)" strokeOpacity={0.18} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s linear", filter: urgent ? "drop-shadow(0 0 6px var(--ember))" : "none" }}
        />
      </svg>
      {showDigits && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="tnum text-[1.05em] leading-none" style={{ color }}>
              {fmtCountdown(remainingMs)}
            </div>
            {label && <div className="mt-1 text-[0.62em] uppercase tracking-wider text-[var(--ink-dim)]">{label}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
