import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Sparkles, Eye, ArrowRight } from "lucide-react";
import { CURRENCY, currentPrice, fmtCountdown, msUntil } from "../lib/data";
import { useClock } from "../lib/theme";
import { Eyebrow } from "../components/dusk/Reveal";
import { Footer } from "../components/dusk/Footer";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import * as api from "../lib/api";

const BAG_HINTS = [
  { glyph: "🧁", hint: "tarts · macarons · a slice or two" },
  { glyph: "🥐", hint: "viennoiserie · loaves · morning bakes" },
  { glyph: "🍛", hint: "a full dinner · sides · bread" },
];

export default function SurpriseBag() {
  useClock(1000);
  const [listings, setListings] = useState<api.Listing[]>([]);
  useEffect(() => {
    // just fetch anything that we can use for the demo
    api.getListings({}).then((data) => {
      // simulate surprise bags by taking the first 3
      setListings(data.slice(0, 3));
    });
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Eyebrow>Surprise surplus bags</Eyebrow>
        <div className="mt-4 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1] text-[var(--ink)]">
              You don't know what's inside. <span className="italic text-dusk-gradient">That's the best part.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[var(--ink-dim)]">
              A mystery mix of a shop's unsold best, assembled at closing. You see the category and the value range —
              never the exact items. Pay a third, rescue a feast.
            </p>
          </div>
          <PaperBag />
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l, i) => (
            <BagCard key={l.id} listing={l} index={i} hintInfo={BAG_HINTS[i % BAG_HINTS.length]} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PaperBag() {
  const [peek, setPeek] = useState(false);
  return (
    <div
      className="relative mx-auto grid aspect-square w-full max-w-sm cursor-pointer place-items-center"
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
      onClick={() => setPeek((p) => !p)}
    >
      <div className="absolute -inset-6 -z-10 rounded-full dusk-gradient opacity-25 blur-3xl" />
      {/* the bag */}
      <div className="relative h-72 w-56">
        <div className="absolute bottom-0 h-56 w-full rounded-b-2xl rounded-t-lg bg-gradient-to-b from-[#e9c79a] to-[#caa06a] shadow-dusk dark:from-[#7a5c3a] dark:to-[#56401f]" />
        <div className="absolute bottom-0 h-56 w-full rounded-b-2xl bg-[repeating-linear-gradient(90deg,transparent_0_26px,rgba(0,0,0,0.05)_26px_28px)]" />
        {/* folded top */}
        <motion.div
          className="absolute left-0 top-0 z-20 h-16 w-full origin-bottom rounded-t-lg bg-gradient-to-b from-[#d9b483] to-[#c19a5f] dark:from-[#6a4f30] dark:to-[#523c1e]"
          animate={{ rotateX: peek ? -55 : 0, y: peek ? -6 : 0 }}
          style={{ transformPerspective: 600 }}
        />
        {/* peek glow */}
        <motion.div
          className="absolute left-1/2 top-10 z-10 -translate-x-1/2 text-5xl"
          animate={{ opacity: peek ? 1 : 0, y: peek ? -6 : 6 }}
        >
          ✨
        </motion.div>
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-center text-[#5a3d1a] dark:text-[#f3dcb0]">
          <div className="font-display text-3xl font-semibold">{CURRENCY}150</div>
          <div className="text-xs opacity-80">value ~{CURRENCY}450</div>
        </div>
      </div>
      <div className="absolute bottom-2 inline-flex items-center gap-1.5 text-xs text-[var(--ink-dim)]">
        <Eye className="size-3.5" /> {peek ? "shh — that's all you get" : "hover to peek"}
      </div>
    </div>
  );
}

function BagCard({ listing, index, hintInfo }: { listing: api.Listing; index: number; hintInfo: { glyph: string; hint: string } }) {
  const [hover, setHover] = useState(false);
  const v = listing.vendor;
  const remaining = msUntil(listing);
  const valueLow = listing.value_low ?? Math.round(listing.original_price * 2.5);
  const valueHigh = listing.value_high ?? Math.round(listing.original_price * 3.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to={`/listing/${listing.id}`}
        className="group block overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)] shadow-dusk ease-dusk transition-transform hover:-translate-y-1"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          {/* wrapped — image blurs/hides behind kraft texture, micro-reveal on hover */}
          <ImageWithFallback src={listing.photos[0] ?? ""} alt="" className={`size-full object-cover transition-all duration-700 ${hover ? "scale-105 blur-[2px]" : "blur-xl scale-110"}`} />
          <div className="absolute inset-0 bg-[var(--indigo)]/45" />
          <div className="absolute inset-0 grid place-items-center">
            <motion.div animate={{ scale: hover ? 1.08 : 1, rotate: hover ? -4 : 0 }} className="text-6xl drop-shadow-lg">
              {hintInfo.glyph}
            </motion.div>
          </div>
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--indigo)]/80 px-2.5 py-1 text-xs text-white backdrop-blur">
            <Sparkles className="size-3.5" /> Surprise
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <span className="text-sm drop-shadow">{v?.name ?? ""}</span>
            <span className="tnum rounded-full bg-black/40 px-2 py-0.5 text-xs backdrop-blur">{fmtCountdown(remaining)}</span>
          </div>
        </div>
        <div className="space-y-2 p-5">
          <div className="font-display text-lg text-[var(--ink)]">{listing.category} surprise bag</div>
          <div className="text-sm text-[var(--ink-dim)] transition-colors group-hover:text-[var(--amber)]">{hover ? hintInfo.hint : "contents revealed at pickup"}</div>
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className="tnum font-display text-2xl font-semibold text-[var(--ink)]">{CURRENCY}{currentPrice(listing)}</div>
              <div className="text-xs text-[var(--ink-dim)]">value {CURRENCY}{valueLow}–{CURRENCY}{valueHigh}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-[var(--ember)]">Reserve <ArrowRight className="size-4" /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
