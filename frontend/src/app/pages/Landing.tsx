import { useRef } from "react";
import { Link } from "react-router";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useInView,
  useMotionValueEvent,
} from "motion/react";
import { ArrowRight, MapPin, Camera, Timer, QrCode, Sparkles, Leaf } from "lucide-react";
import { MagneticButton } from "../components/dusk/MagneticButton";
import { Reveal, Eyebrow } from "../components/dusk/Reveal";
import { ListingCard } from "../components/dusk/ListingCard";
import { Footer } from "../components/dusk/Footer";
import { CURRENCY } from "../lib/data";
import { useState, useEffect } from "react";
import * as api from "../lib/api";

export default function Landing() {
  const [listings, setListings] = useState<api.Listing[]>([]);
  useEffect(() => {
    api.getListings({}).then(setListings).catch(console.error);
  }, []);

  return (
    <div>
      <Hero listings={listings} />
      <PriceFallsScene />
      <LastHourTimeline />
      <NeighborhoodStreet />
      <ImpactBand />
      <HowItWorks />
      <FeaturedListings listings={listings} />
      <ForVendors />
      <Footer />
    </div>
  );
}

/* ----------------------------------------------------------------- Hero */

function Hero({ listings }: { listings: api.Listing[] }) {
  const demo = listings[0];
  if (!demo) return <div className="min-h-[92vh]" />; // Loading state

  return (
    <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-24 pt-10">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal>
            <Eyebrow>Hyperlocal · expiring-soon marketplace</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 font-display text-[clamp(3rem,9vw,6rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
              Good food,
              <br />
              <span className="italic text-dusk-gradient">before</span> it's gone.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg text-[var(--ink-dim)]">
              Local bakeries, grocers and kitchens sell their surplus at prices that{" "}
              <span className="text-[var(--amber)]">fall by the minute</span> as closing time nears.
              Reserve, pay, collect — before the timer hits zero.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/discover">
                <MagneticButton className="text-base">
                  Find food near you <ArrowRight className="size-4" />
                </MagneticButton>
              </Link>
              <Link to="/vendor">
                <MagneticButton variant="outline">I'm a vendor</MagneticButton>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* live demo ticket */}
        <Reveal delay={0.2}>
          <HeroTicket listing={demo} />
        </Reveal>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--ink-dim)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        Scroll — watch the sun fall
        <span className="h-9 w-px bg-gradient-to-b from-[var(--amber)] to-transparent" />
      </motion.div>
    </section>
  );
}

function HeroTicket({ listing }: { listing: api.Listing }) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] dusk-gradient opacity-30 blur-2xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-elev)]/85 p-3 shadow-dusk backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={listing.photos[0] ?? ""} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <div className="text-sm opacity-80">Aurelio's Bakehouse</div>
              <div className="font-display text-lg leading-tight">{listing.title}</div>
            </div>
            <div className="rounded-full bg-[var(--ember)] px-2.5 py-1 text-xs">−42%</div>
          </div>
        </div>
        <div className="flex items-end justify-between p-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--ink-dim)]">Right now</div>
            <div className="tnum font-display text-3xl font-semibold text-[var(--ink)]">{CURRENCY}313</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--ink-dim)]">closes in</div>
            <div className="tnum text-[var(--ember)]">38:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ Scene: price falls */

function PriceFallsScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30 });

  const original = 540;
  const floor = 313 - 140; // dramatic floor for the demo
  // exponential decay along scroll
  const priceMV = useTransform(p, (v) => Math.round(original - (original - floor) * Math.pow(v, 1.7)));
  const [price, setPrice] = useState(original);
  useMotionValueEvent(priceMV, "change", (v) => setPrice(v));
  const pct = Math.round((1 - price / original) * 100);

  // sparkline path draw
  const dash = useTransform(p, [0, 1], [1, 0]);
  const dotX = useTransform(p, [0, 1], [40, 360]);
  const dotY = useTransform(p, (v) => 30 + Math.pow(v, 1.7) * 120);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-5 py-28">
      <Reveal>
        <Eyebrow>The core mechanic</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] text-[var(--ink)]">
          The longer you wait, the less you pay — <span className="italic text-[var(--amber)]">and the more you gamble.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid items-center gap-10 rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk backdrop-blur-md md:grid-cols-2 md:p-10">
        <div>
          <div className="text-sm uppercase tracking-wider text-[var(--ink-dim)]">Croissant box · decaying live</div>
          <div className="mt-3 flex items-baseline gap-4">
            <span className="tnum font-display text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-none text-[var(--ink)]">
              {CURRENCY}
              {price}
            </span>
            <span className="tnum text-xl text-[var(--ink-dim)] line-through opacity-60">{CURRENCY}{original}</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--ember)]/12 px-3 py-1.5 text-[var(--ember)]">
            <Timer className="size-4" /> price drop <span className="tnum font-semibold">−{pct}%</span>
          </div>
          <p className="mt-6 max-w-sm text-[var(--ink-dim)]">
            {reduce
              ? "Each listing's price follows a decay curve from list time to closing — shown ticking, not as a static badge."
              : "Scroll, and this listing falls along its decay curve. In the real app it's the clock, not your scrollbar, doing the work."}
          </p>
        </div>

        {/* the decay curve drawing */}
        <div className="relative">
          <svg viewBox="0 0 400 170" className="w-full">
            <defs>
              <linearGradient id="curveg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold)" />
                <stop offset="55%" stopColor="var(--ember)" />
                <stop offset="100%" stopColor="var(--indigo)" />
              </linearGradient>
            </defs>
            {/* grid */}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="40" x2="380" y1={30 + i * 40} y2={30 + i * 40} stroke="var(--ink-dim)" strokeOpacity="0.12" />
            ))}
            <motion.path
              d="M40 30 C 140 35, 220 60, 290 110 S 360 150, 360 150"
              fill="none"
              stroke="url(#curveg)"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{ pathLength: useTransform(p, [0, 1], [0.05, 1]) }}
            />
            <motion.circle r="7" fill="var(--ember)" cx={dotX as any} cy={dotY as any} />
            <motion.circle r="13" fill="var(--ember)" opacity="0.25" cx={dotX as any} cy={dotY as any} />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-[var(--ink-dim)]">
            <span>listed · full price</span>
            <span>closing · fire sale</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------- Scene: horizontal last hour */

const HOUR_STEPS = [
  { time: "17:00", label: "Listed at full price", price: "৳540", tone: "var(--gold)" },
  { time: "18:30", label: "−30% · happy hour", price: "৳378", tone: "var(--amber)" },
  { time: "19:30", label: "−60% · last call", price: "৳216", tone: "var(--ember)" },
  { time: "20:00", label: "Rescued, not wasted", price: "Saved", tone: "var(--success)" },
];

function LastHourTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);
  const sky = useTransform(scrollYProgress, [0, 1], [0.05, 0.85]);

  if (reduce) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Eyebrow>A shop's final hour</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOUR_STEPS.map((s) => (
            <HourCard key={s.time} step={s} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: sky, background: "linear-gradient(90deg, transparent, rgba(43,33,80,0.5))" } as any} />
        <div className="mx-auto w-full max-w-7xl px-5">
          <Eyebrow>A shop's final hour</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[var(--ink)]">
            17:00 to 20:00, sideways.
          </h2>
        </div>
        <motion.div className="mt-10 flex gap-6 px-5" style={{ x }}>
          {HOUR_STEPS.map((s, i) => (
            <div key={s.time} className="w-[78vw] shrink-0 sm:w-[44vw] lg:w-[30vw]">
              <HourCard step={s} index={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HourCard({ step, index = 0 }: { step: (typeof HOUR_STEPS)[number]; index?: number }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/80 p-7 shadow-dusk backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="tnum font-display text-4xl font-semibold" style={{ color: step.tone }}>
          {step.time}
        </span>
        <span className="grid size-9 place-items-center rounded-full text-sm" style={{ background: step.tone, color: "#1a0f08" }}>
          {index + 1}
        </span>
      </div>
      <div className="mt-8 tnum font-display text-3xl font-semibold text-[var(--ink)]">{step.price}</div>
      <div className="mt-2 text-[var(--ink-dim)]">{step.label}</div>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[var(--ink-dim)]/15">
        <div className="h-full rounded-full" style={{ width: `${30 + index * 23}%`, background: step.tone }} />
      </div>
    </div>
  );
}

/* --------------------------------------- Scene: parallax neighborhood */

function NeighborhoodStreet() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const farY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const midY = useTransform(scrollYProgress, [0, 1], [80, -90]);
  const nearY = useTransform(scrollYProgress, [0, 1], [120, -160]);
  const lit = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  const shops = ["🥐", "🍞", "☕", "🍣", "🧁", "🥬", "🍛", "🍰"];

  return (
    <section ref={ref} className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <Eyebrow>Your neighbourhood, at closing time</Eyebrow>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] text-[var(--ink)]">
            The whole street lights up — one warm window at a time.
          </h2>
        </Reveal>
      </div>

      <div className="relative mt-14 h-[48vh] min-h-[360px] overflow-hidden">
        {/* far rooftops — hazy depth */}
        <motion.div style={{ y: farY }} className="absolute inset-x-0 bottom-[40%]">
          <div className="mx-auto flex max-w-6xl items-end justify-around px-4 opacity-45 blur-[0.5px]">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="relative w-12 rounded-t-md bg-[var(--indigo)]/70" style={{ height: 44 + ((i * 19) % 70) }}>
                {i % 3 === 0 && <span className="absolute -top-2 left-1/2 h-2 w-px -translate-x-1/2 bg-[var(--indigo)]" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* mid shopfronts — refined storefronts with awnings + signage */}
        <motion.div style={{ y: midY }} className="absolute inset-x-0 bottom-[18%]">
          <div className="mx-auto flex max-w-5xl items-end justify-around gap-3 px-4">
            {shops.map((s, i) => (
              <div key={i} className="relative w-[12.5%] min-w-[78px]">
                {/* sign board */}
                <div className="mx-auto mb-1 h-2 w-1/2 rounded-full bg-[var(--ink-dim)]/40" />
                {/* facade */}
                <div className="relative overflow-hidden rounded-t-xl border border-black/10 bg-[var(--bg-elev)] shadow-dusk">
                  {/* lit upper window */}
                  <motion.div style={{ opacity: lit } as any} className="m-1.5 mb-1 h-9 rounded-md" >
                    <div className="size-full rounded-md" style={{ background: "linear-gradient(180deg, var(--amber), color-mix(in oklab, var(--amber), black 18%))", boxShadow: "0 0 12px var(--amber)" }} />
                  </motion.div>
                  {/* striped awning */}
                  <div className="h-3 w-full" style={{ background: `repeating-linear-gradient(90deg, ${i % 2 ? "var(--ember)" : "var(--amber)"} 0 8px, #ffffff22 8px 16px)` }} />
                  {/* storefront */}
                  <div className="grid h-12 grid-cols-[1fr_auto] items-end gap-1 p-1.5">
                    <div className="grid h-full place-items-center rounded-sm bg-[var(--bg)]/60 text-xl">{s}</div>
                    <div className="h-full w-2 rounded-sm bg-[var(--ink-dim)]/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* foreground: cobbled street + lamp glow */}
        <motion.div style={{ y: nearY }} className="absolute inset-x-0 bottom-0">
          <div className="h-2 w-full" style={{ background: "repeating-linear-gradient(90deg, var(--ember) 0 30px, color-mix(in oklab, var(--ember), white 30%) 30px 60px)" }} />
          <div className="relative h-16 w-full overflow-hidden" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--indigo), black 30%), var(--bg))" }}>
            <div className="absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,0.06) 46px 48px)" }} />
            {/* warm streetlamp pools */}
            {[20, 50, 80].map((x) => (
              <div key={x} className="absolute bottom-0 size-24 -translate-x-1/2 rounded-full" style={{ left: `${x}%`, background: "radial-gradient(circle at 50% 100%, rgba(255,180,84,0.35), transparent 65%)" }} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------- Impact counter band */

function ImpactBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-5 py-24">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-elev)]/70 p-8 shadow-dusk backdrop-blur-md md:p-14">
        <Eyebrow>Impact is a first-class layer</Eyebrow>
        <div className="mt-6 grid items-end gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="font-display text-[clamp(3rem,11vw,7rem)] font-semibold leading-none text-dusk-gradient">
              <Counter to={412000} run={inView} />
            </div>
            <div className="mt-2 text-xl text-[var(--ink)]">meals rescued, and counting.</div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { v: 168, u: "tonnes diverted", icon: <Leaf className="size-4" /> },
                { v: 357, u: "tonnes CO₂e avoided", icon: <Sparkles className="size-4" /> },
                { v: 2400, u: "vendors selling", icon: <MapPin className="size-4" /> },
              ].map((s) => (
                <div key={s.u} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 p-4">
                  <div className="tnum font-display text-2xl font-semibold text-[var(--ink)]">
                    <Counter to={s.v} run={inView} />
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-[var(--ink-dim)]">{s.icon}{s.u}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--ink-dim)]">This evening's progress toward zero waste</div>
            <div className="mt-3 h-5 overflow-hidden rounded-full bg-[var(--ink-dim)]/15">
              <motion.div
                className="h-full dusk-gradient"
                initial={{ width: 0 }}
                animate={inView ? { width: "78%" } : {}}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--ink-dim)]">
              <span>0</span>
              <span className="tnum">78% of today's surplus listed</span>
            </div>
            <Link to="/impact" className="mt-7 inline-flex items-center gap-2 text-[var(--amber)] hover:underline">
              See your rescue streak <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduce) return setN(to);
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(to * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to, reduce]);
  return <span className="tnum">{n.toLocaleString("en-IN")}</span>;
}

/* ------------------------------------------- Pinned how-it-works */

const STEPS = [
  { icon: <Camera className="size-6" />, title: "Listed", copy: "A shop snaps its surplus. Our agent drafts the title, allergens and a starting price + decay curve." },
  { icon: <Timer className="size-6" />, title: "Reserved", copy: "You catch it on the map as the price falls, lock the price you see, and pay in seconds." },
  { icon: <QrCode className="size-6" />, title: "Collected", copy: "Scan a QR at pickup. The meal is rescued, your streak grows, the waste never happens." },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(2, Math.floor(v * 3)));
  });

  if (reduce) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-7">
              <div className="text-[var(--ember)]">{s.icon}</div>
              <div className="mt-4 font-display text-2xl text-[var(--ink)]">{i + 1}. {s.title}</div>
              <p className="mt-2 text-[var(--ink-dim)]">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const ring = STEPS.length;
  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-5">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <div className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.title}
                  animate={{ opacity: active === i ? 1 : 0.32, x: active === i ? 0 : -4 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-2xl border transition-colors"
                    style={{
                      borderColor: active === i ? "var(--ember)" : "var(--border)",
                      color: active === i ? "var(--ember)" : "var(--ink-dim)",
                      background: active === i ? "color-mix(in oklab, var(--ember) 10%, transparent)" : "transparent",
                    }}
                  >
                    {s.icon}
                  </span>
                  <div>
                    <div className="font-display text-2xl text-[var(--ink)]">{s.title}</div>
                    <p className="mt-1 max-w-sm text-[var(--ink-dim)]">{s.copy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* draining ring that crossfades labels */}
          <div className="relative grid place-items-center">
            <svg viewBox="0 0 240 240" className="w-64">
              <circle cx="120" cy="120" r="100" fill="none" stroke="var(--ink-dim)" strokeOpacity="0.15" strokeWidth="10" />
              <motion.circle
                cx="120" cy="120" r="100" fill="none" stroke="var(--ember)" strokeWidth="10" strokeLinecap="round"
                transform="rotate(-90 120 120)"
                style={{ pathLength: scrollYProgress }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-dim)]">Step {active + 1} / {ring}</div>
              <div className="mt-1 font-display text-4xl font-semibold text-[var(--ink)]">{STEPS[active].title}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------- featured + vendors */

function FeaturedListings({ listings }: { listings: api.Listing[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="flex items-end justify-between gap-4">
        <Reveal>
          <Eyebrow>Closing soon near you</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[var(--ink)]">
            Catch the last call.
          </h2>
        </Reveal>
        <Link to="/discover" className="hidden shrink-0 items-center gap-2 text-[var(--amber)] hover:underline sm:inline-flex">
          Open the map <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.slice(0, 3).map((l, i) => (
          <ListingCard key={l.id} listing={l} index={i} />
        ))}
      </div>
    </section>
  );
}

function ForVendors() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] p-8 md:p-14">
        <div className="absolute inset-0 -z-10 dusk-gradient opacity-[0.14]" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>For vendors</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] text-[var(--ink)]">
              Clear your shelves. <span className="italic text-[var(--amber)]">Not your conscience.</span>
            </h2>
            <p className="mt-5 max-w-md text-[var(--ink-dim)]">
              Snap a photo and our listing agent drafts everything. A forecaster nudges you on timing,
              a pricing agent tunes each decay curve, and scan-to-fulfill closes the loop.
            </p>
            <Link to="/vendor" className="mt-7 inline-block">
              <MagneticButton>Open the vendor console <ArrowRight className="size-4" /></MagneticButton>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Snap to list", "Photo → drafted listing in seconds"],
              ["Waste-risk nudges", "“List croissants by 16:30 — ~6 likely unsold”"],
              ["Auto-pricing", "Bounded decay curves you approve"],
              ["Scan to fulfill", "QR pickup, instant reconciliation"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-5 shadow-dusk">
                <div className="font-display text-lg text-[var(--ink)]">{t}</div>
                <div className="mt-1 text-sm text-[var(--ink-dim)]">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
