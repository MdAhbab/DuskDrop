import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { Flame, Leaf, Wind, Share2, Trophy, Utensils } from "lucide-react";
import { Eyebrow } from "../components/dusk/Reveal";
import { MagneticButton } from "../components/dusk/MagneticButton";
import { Footer } from "../components/dusk/Footer";
import { toast } from "sonner";
import * as api from "../lib/api";
import { FALLBACK_IMPACT } from "../lib/fallback";

function Num({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setN(to);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1400);
      setN(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref} className="tnum">{n.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}</span>;
}

export default function Impact() {
  const [stats, setStats] = useState<api.ImpactStats>(FALLBACK_IMPACT);

  useEffect(() => {
    api.getMyImpact().then(setStats).catch(console.error);
  }, []);

  const max = Math.max(...stats.weekly.map((d) => d.meals));

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Eyebrow>Your rescue ledger</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1] text-[var(--ink)]">
          Saving food, made <span className="italic text-dusk-gradient">visible.</span>
        </h1>

        {/* big numerals */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: <Utensils className="size-5" />, v: stats.my_meals, label: "meals rescued", dec: 0 },
            { icon: <Leaf className="size-5" />, v: stats.my_kg, label: "kg diverted", dec: 1 },
            { icon: <Wind className="size-5" />, v: stats.my_co2e_kg, label: "kg CO₂e avoided", dec: 1 },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-7 shadow-dusk">
              <div className="text-[var(--ember)]">{s.icon}</div>
              <div className="mt-4 font-display text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none text-[var(--ink)]">
                <Num to={s.v} decimals={s.dec} />
              </div>
              <div className="mt-2 text-[var(--ink-dim)]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* streak ribbon + weekly */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-7 shadow-dusk">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="size-6 text-[var(--ember)]" />
                <div>
                  <div className="font-display text-2xl text-[var(--ink)]">{stats.streak_days}-day streak</div>
                  <div className="text-sm text-[var(--ink-dim)]">Best: {stats.best_streak} days</div>
                </div>
              </div>
              <span className="rounded-full bg-[var(--amber)]/15 px-3 py-1 text-sm text-[var(--amber)]">On fire</span>
            </div>
            {/* streak ribbon */}
            <div className="mt-5 flex gap-1.5">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 flex-1 rounded-md"
                  style={{ background: i < stats.streak_days ? "var(--dusk-gradient)" : "var(--ink-dim)", opacity: i < stats.streak_days ? 1 : 0.15 }}
                />
              ))}
            </div>
            <div className="mt-8 text-sm text-[var(--ink-dim)]">This week</div>
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weekly}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--ink-dim)", fontSize: 12 }} />
                  <Bar dataKey="meals" radius={[6, 6, 0, 0]}>
                    {stats.weekly.map((d, i) => (
                      <Cell key={i} fill={d.meals === max ? "var(--ember)" : "var(--amber)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* leaderboard */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-7 shadow-dusk">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-[var(--gold)]" />
              <div className="font-display text-xl text-[var(--ink)]">{stats.ward_name} leaderboard</div>
            </div>
            <div className="mt-5 space-y-2">
              {stats.leaderboard.map((r, i) => (
                <div
                  key={r.name}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${r.you ? "bg-[var(--ember)]/12 ring-1 ring-[var(--ember)]/40" : "bg-[var(--bg)]/40"}`}
                >
                  <span className="tnum w-5 text-[var(--ink-dim)]">{i + 1}</span>
                  <span className={`flex-1 ${r.you ? "text-[var(--ember)]" : "text-[var(--ink)]"}`}>{r.name}</span>
                  <span className="tnum text-[var(--ink-dim)]">{r.meals} meals</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* shareable card generator */}
        <div className="mt-6 grid items-center gap-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-7 shadow-dusk md:grid-cols-2">
          <div>
            <Eyebrow>Share your rescue</Eyebrow>
            <h2 className="mt-3 font-display text-2xl text-[var(--ink)]">A dusk-gradient card, rendered just for you.</h2>
            <p className="mt-2 text-[var(--ink-dim)]">Show your neighbourhood what catching the last call adds up to.</p>
            <div className="mt-5">
              <MagneticButton onClick={() => toast.success("Card saved", { description: "Your shareable rescue card has been generated." })}>
                <Share2 className="size-4" /> Generate share card
              </MagneticButton>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl dusk-gradient p-6 text-[var(--bg)]">
            <div className="absolute inset-0 grain-overlay" style={{ position: "absolute", opacity: 0.12, mixBlendMode: "overlay" }} />
            <div className="text-sm uppercase tracking-[0.2em] opacity-80">DuskDrop · rescue card</div>
            <div className="mt-6 font-display text-5xl font-semibold leading-none">{stats.my_meals} meals</div>
            <div className="mt-1 text-lg">rescued before they were wasted</div>
            <div className="absolute bottom-6 left-6 flex items-end gap-6">
              <div><div className="tnum font-display text-2xl">{stats.my_kg} kg</div><div className="text-xs opacity-80">diverted</div></div>
              <div><div className="tnum font-display text-2xl">{stats.streak_days} days</div><div className="text-xs opacity-80">streak</div></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
