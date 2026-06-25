import { useScroll, useTransform, useReducedMotion, motion, useSpring, type MotionValue } from "motion/react";
import { useMemo } from "react";
import { useTheme } from "../../lib/theme";
import { Skyline } from "./Skyline";

/**
 * DuskSky — the global, fixed background and the soul of the product.
 * As the page scrolls the sky deepens and the celestial body descends,
 * growing larger and reddening toward the horizon (as it does in real life):
 *   · Light: a warm SUN sinks from afternoon gold to ember.
 *   · Dark:  a pale MOON sinks and warms into a harvest-amber over a dusk band.
 * Honors prefers-reduced-motion (static gradient + static body).
 */
export function DuskSky() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 26, mass: 0.5 });

  const stops = useMemo(
    () =>
      isDark
        ? {
            top: ["#0f1330", "#141738", "#1c1942", "#1b1230", "#070510"],
            mid: ["#171a3a", "#20203f", "#6a3550", "#3a2240", "#0b0814"],
            bottom: ["#27244e", "#3a2d5c", "#b04a30", "#5c2b3e", "#0d0a15"],
          }
        : {
            top: ["#FCE2A4", "#FAC57B", "#F2A05E", "#E9855B", "#C77B83"],
            mid: ["#FBD89A", "#F7B873", "#F09760", "#E5825A", "#CE8079"],
            bottom: ["#FFF2CE", "#FFD58F", "#F8A35D", "#EB844E", "#D88B6D"],
          },
    [isDark],
  );

  const topColor = useTransform(p, [0, 0.25, 0.55, 0.8, 1], stops.top);
  const midColor = useTransform(p, [0, 0.25, 0.55, 0.8, 1], stops.mid);
  const bottomColor = useTransform(p, [0, 0.25, 0.55, 0.8, 1], stops.bottom);
  const background = useTransform(
    [topColor, midColor, bottomColor] as const,
    ([t, m, b]: string[]) => `linear-gradient(180deg, ${t} 0%, ${m} 60%, ${b} 100%)`,
  );

  // celestial body: descends, GROWS, and dims slightly near the horizon
  const bodyY = useTransform(p, [0, 1], ["8vh", "78vh"]);
  const bodyScale = useTransform(p, [0, 1], [0.92, 1.32]);
  const bodyOpacity = useTransform(p, [0, 0.78, 0.97, 1], isDark ? [1, 1, 0.72, 0.5] : [1, 1, 0.55, 0.08]);
  const horizonGlow = useTransform(p, [0.22, 0.8], [0, 1]);
  const skylineOpacity = useTransform(p, [0.18, 0.6], [0, 1]);
  const starOpacity = useTransform(p, [0, 0.7], isDark ? [0.95, 0.55] : [0, 0.18]);
  const streakOpacity = useTransform(p, [0.15, 0.55, 1], [0, isDark ? 0.16 : 0.26, 0.06]);

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: ((i * 67) % 100) + (i % 5) * 0.7,
        top: (i * 41) % 62,
        size: (i % 4) * 0.6 + 1,
        dur: 3 + (i % 6) * 0.6,
        delay: (i % 9) * 0.5,
      })),
    [],
  );

  const streaks = useMemo(
    () => [
      { top: "52%", w: "46%", left: "8%", h: 10, dur: 90 },
      { top: "61%", w: "38%", left: "44%", h: 8, dur: 120 },
      { top: "68%", w: "30%", left: "20%", h: 7, dur: 70 },
      { top: "47%", w: "26%", left: "60%", h: 9, dur: 140 },
    ],
    [],
  );

  if (reduce) {
    return (
      <div aria-hidden className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${stops.top[0]}, ${stops.mid[2]}, ${stops.bottom[2]})` }} />
        <div className="absolute left-1/2 top-[12vh] size-56 -translate-x-1/2 rounded-full" style={{ background: isDark ? "radial-gradient(circle at 38% 35%, #f6f3ff, #c8cae6 70%)" : "radial-gradient(circle at 38% 35%, #fff6d6, #ff9a4d 72%)" }} />
        <Skyline theme={theme} />
      </div>
    );
  }

  return (
    <motion.div aria-hidden className="fixed inset-0 -z-10 overflow-hidden" style={{ background }}>
      {/* stars */}
      <motion.div className="absolute inset-0" style={{ opacity: starOpacity }}>
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animation: `ddTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`, boxShadow: "0 0 4px rgba(255,255,255,0.8)" }}
          />
        ))}
      </motion.div>

      {/* wispy sunset light-streaks (catching the low light — not overcast) */}
      <motion.div className="absolute inset-0" style={{ opacity: streakOpacity }}>
        {streaks.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: c.top,
              left: c.left,
              width: c.w,
              height: c.h,
              filter: "blur(7px)",
              background: isDark
                ? "linear-gradient(90deg, transparent, rgba(255,150,90,0.9), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,235,200,0.95), transparent)",
              animation: `ddDrift ${c.dur}s ease-in-out ${i}s infinite alternate`,
            }}
          />
        ))}
      </motion.div>

      {/* celestial body */}
      <motion.div className="absolute left-1/2 -translate-x-1/2" style={{ top: bodyY, scale: bodyScale, opacity: bodyOpacity }}>
        {isDark ? <Moon p={p} /> : <Sun p={p} />}
      </motion.div>

      {/* atmospheric haze band near the horizon */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          opacity: horizonGlow,
          background: isDark
            ? "linear-gradient(180deg, transparent, rgba(176,74,48,0.22) 38%, rgba(13,10,21,0.92))"
            : "linear-gradient(180deg, transparent, rgba(255,150,80,0.28) 36%, rgba(216,139,109,0.55))",
        }}
      />

      {/* premium skyline */}
      <motion.div className="absolute inset-0" style={{ opacity: skylineOpacity }}>
        <Skyline theme={theme} />
      </motion.div>

      {/* gentle global vignette for depth */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 30%, transparent 55%, rgba(0,0,0,0.28))" }} />
    </motion.div>
  );
}

/* --------------------------------------------------------------- Sun */
function Sun({ p }: { p: MotionValue<number> }) {
  // atmospheric reddening as it descends
  const c1 = useTransform(p, [0, 0.5, 1], ["#fff8df", "#ffe7b0", "#ffd6ad"]);
  const c2 = useTransform(p, [0, 0.5, 1], ["#ffd873", "#ff9e4a", "#ff6a3d"]);
  const c3 = useTransform(p, [0, 0.5, 1], ["#ff9e4a", "#f57b34", "#cf2e15"]);
  const coreBg = useTransform([c1, c2, c3] as const, ([a, b, c]: string[]) => `radial-gradient(circle at 38% 32%, ${a} 0%, ${b} 42%, ${c} 100%)`);
  const glowC = useTransform(p, [0, 1], ["rgba(255,175,95,0.5)", "rgba(255,80,45,0.55)"]);
  const glowBg = useTransform(glowC, (x) => `radial-gradient(circle, ${x} 0%, rgba(255,120,60,0.16) 40%, transparent 66%)`);

  return (
    <div className="relative grid place-items-center" style={{ width: "min(48vw, 440px)", height: "min(48vw, 440px)" }}>
      {/* ambient sky glow that follows the sun */}
      <motion.div className="absolute rounded-full" style={{ width: "190%", height: "190%", background: glowBg, filter: "blur(48px)" }} />
      {/* slow radiant rays */}
      <div
        className="absolute size-[78%] rounded-full opacity-40"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,210,130,0.5) 8deg, transparent 16deg, transparent 30deg, rgba(255,190,110,0.4) 38deg, transparent 46deg)",
          maskImage: "radial-gradient(circle, transparent 38%, black 42%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 38%, black 42%, transparent 72%)",
          animation: "ddRays 80s linear infinite",
        }}
      />
      {/* corona */}
      <div className="absolute size-[46%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,225,160,0.9), rgba(255,160,80,0.2) 70%, transparent)", filter: "blur(6px)" }} />
      {/* crisp core (color-shifting) */}
      <motion.div
        className="relative size-[38%] rounded-full"
        style={{ background: coreBg, boxShadow: "0 0 70px 10px rgba(255,150,70,0.5), inset -8px -10px 26px rgba(180,50,20,0.5), inset 6px 8px 20px rgba(255,245,200,0.6)" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------- Moon */
function Moon({ p }: { p: MotionValue<number> }) {
  // cool silver high up -> warm harvest amber near the horizon
  const c1 = useTransform(p, [0, 0.5, 1], ["#fdfcff", "#fdf2dd", "#ffe2bd"]);
  const c2 = useTransform(p, [0, 0.5, 1], ["#e3e4f4", "#ecdcc2", "#f3c081"]);
  const c3 = useTransform(p, [0, 0.5, 1], ["#a7abce", "#cdb78d", "#d99a55"]);
  const coreBg = useTransform([c1, c2, c3] as const, ([a, b, c]: string[]) => `radial-gradient(circle at 36% 30%, ${a} 0%, ${b} 44%, ${c} 100%)`);
  const glowC = useTransform(p, [0, 1], ["rgba(205,212,255,0.42)", "rgba(255,170,90,0.5)"]);
  const glowBg = useTransform(glowC, (x) => `radial-gradient(circle, ${x} 0%, rgba(150,160,220,0.1) 44%, transparent 64%)`);

  return (
    <div className="relative grid place-items-center" style={{ width: "min(42vw, 380px)", height: "min(42vw, 380px)" }}>
      {/* ambient halo that follows the moon */}
      <motion.div className="absolute rounded-full" style={{ width: "175%", height: "175%", background: glowBg, filter: "blur(40px)" }} />
      {/* core sphere (color-shifting) */}
      <motion.div
        className="relative size-[52%] overflow-hidden rounded-full"
        style={{ background: coreBg, boxShadow: "0 0 56px 8px rgba(200,210,255,0.35), inset -14px -16px 34px rgba(90,96,140,0.55), inset 8px 8px 20px rgba(255,255,255,0.6)" }}
      >
        {[
          { t: "26%", l: "30%", s: "20%" },
          { t: "54%", l: "58%", s: "26%" },
          { t: "66%", l: "26%", s: "15%" },
          { t: "34%", l: "62%", s: "12%" },
          { t: "44%", l: "40%", s: "9%" },
        ].map((c, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{ top: c.t, left: c.l, width: c.s, height: c.s, background: "radial-gradient(circle at 38% 35%, rgba(150,155,190,0.55), rgba(120,126,165,0.8))", boxShadow: "inset 1px 2px 3px rgba(255,255,255,0.45), inset -1px -2px 3px rgba(70,75,115,0.55)" }}
          />
        ))}
      </motion.div>
    </div>
  );
}
