import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import {
  ArrowLeft,
  Bell,
  MapPin,
  Footprints,
  Clock3,
  AlertTriangle,
  Star,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { CURRENCY, fmtCountdown, decay_series_from_listing } from "../lib/data";
import { useClock } from "../lib/theme";
import { CountdownRing } from "../components/dusk/CountdownRing";
import { MagneticButton } from "../components/dusk/MagneticButton";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import { toast } from "sonner";
import NotFound from "./NotFound";
import * as api from "../lib/api";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<api.Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [livePrice, setLivePrice] = useState<api.ListingPrice | null>(null);
  const clock = useClock(5000); // refresh price every 5s

  useEffect(() => {
    if (!id) return;
    api.getListing(id)
      .then(setListing)
      .catch(() => setNotFound(true));
  }, [id]);

  // Live price polling via lightweight endpoint
  useEffect(() => {
    if (!id || !listing) return;
    api.getListingPrice(id)
      .then(setLivePrice)
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, clock, listing?.id]);

  if (notFound) return <NotFound />;
  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ember)] border-t-transparent" />
      </div>
    );
  }

  const vendor = listing.vendor;
  const currentPrice = livePrice?.current_price ?? listing.current_price;
  const discountP = livePrice?.discount_pct ?? listing.discount_pct;
  const msClose = livePrice?.ms_until_close ?? listing.ms_until_close;
  const totalMs = (new Date(listing.expiry_time).getTime() - new Date(listing.list_time).getTime());

  // Build decay series client-side from listing data
  const series = decay_series_from_listing(listing);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-32 pt-6">
      <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft className="size-4" /> Back to the map
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* gallery */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-dusk">
            <motion.div key={activeImg} initial={{ opacity: 0.4, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <ImageWithFallback src={listing.photos[activeImg] ?? ""} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(255,140,77,0.15)]" />
            {listing.is_surprise_bag && (
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--indigo)]/85 px-3 py-1.5 text-sm text-white backdrop-blur">
                <Sparkles className="size-4" /> Surprise bag
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-3">
            {listing.photos.map((g, i) => (
              <button
                key={g}
                onClick={() => setActiveImg(i)}
                className={`overflow-hidden rounded-xl border-2 ease-dusk transition-colors ${i === activeImg ? "border-[var(--ember)]" : "border-transparent opacity-70"}`}
              >
                <ImageWithFallback src={g} alt="" className="size-20 object-cover" />
              </button>
            ))}
          </div>

          {/* vendor card */}
          {vendor && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-4 shadow-dusk">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[var(--bg)]">
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 60% 30%, rgba(255,140,77,0.25), transparent 60%)" }} />
                <svg className="absolute inset-0 size-full"><path d="M-10 70 Q 40 40 110 90" stroke="var(--ink-dim)" strokeOpacity="0.3" strokeWidth="6" fill="none" /></svg>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">{vendor.logo}</span>
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg text-[var(--ink)]">{vendor.name}</div>
                <div className="text-sm text-[var(--ink-dim)]">{vendor.kind} · {vendor.address}</div>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-[var(--gold)]"><Star className="size-3.5 fill-current" />{vendor.rating}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--ink-dim)]"><Footprints className="size-3.5" />{listing.walk_min} min walk</span>
                  <span className="inline-flex items-center gap-1 text-[var(--ink-dim)]"><MapPin className="size-3.5" />{(listing.distance_m / 1000).toFixed(1)} km</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* the price block */}
        <div>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-tight text-[var(--ink)]">{listing.title}</h1>
          <p className="mt-3 text-[var(--ink-dim)]">{listing.description}</p>

          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--ink-dim)]">Price right now</div>
                <div className="mt-1 tnum font-display text-4xl font-semibold text-[var(--ink)]">
                  {CURRENCY}{currentPrice}
                </div>
                {listing.is_surprise_bag && listing.value_low && listing.value_high && (
                  <div className="mt-2 text-sm text-[var(--amber)]">Value {CURRENCY}{listing.value_low}–{CURRENCY}{listing.value_high}</div>
                )}
                <div className="mt-1 text-sm text-[var(--ember)]">−{discountP}% and falling</div>
              </div>
              <CountdownRing remainingMs={msClose} totalMs={totalMs} size={104} label="closes in" />
            </div>

            {/* decay sparkline */}
            <div className="mt-5 h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="dec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--ember)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--ember)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
                  <Tooltip
                    cursor={{ stroke: "var(--amber)" }}
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    labelFormatter={() => ""}
                    formatter={(v) => [`${CURRENCY}${v}`, "price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="var(--ember)" strokeWidth={2} fill="url(#dec)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs text-[var(--ink-dim)]">
              <span>listed · {CURRENCY}{listing.original_price}</span>
              <span className="text-[var(--ember)]">−{discountP}% and falling</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[var(--bg)]/40 p-3">
                <div className="text-xs text-[var(--ink-dim)]">Pickup window</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[var(--ink)]"><Clock3 className="size-4" />{listing.pickup_window_label}</div>
              </div>
              <div className="rounded-2xl bg-[var(--bg)]/40 p-3">
                <div className="text-xs text-[var(--ink-dim)]">Remaining</div>
                <div className="mt-0.5 text-[var(--ink)]">{listing.qty_remaining} of {listing.qty_total} left</div>
              </div>
            </div>
          </div>

          {/* allergens + dietary */}
          <div className="mt-6">
            <div className="text-sm text-[var(--ink-dim)]">Contents & allergens</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {listing.dietary.map((d) => (
                <span key={d} className="rounded-full bg-[var(--success)]/12 px-3 py-1 text-sm text-[var(--success)]">{d}</span>
              ))}
              {listing.allergens.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--ink-dim)]">
                  <AlertTriangle className="size-3" />{a}
                </span>
              ))}
              {listing.allergens.length === 0 && <span className="text-sm text-[var(--ink-dim)]">No declared allergens</span>}
            </div>
          </div>

          <button
            onClick={() => toast.success("Snipe alert set", { description: `We'll ping you when ${listing.title} crosses your target price.` })}
            className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--amber)] hover:underline"
          >
            <Bell className="size-4" /> Set a snipe alert instead
          </button>
        </div>
      </div>

      {/* sticky reserve bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg)]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-[var(--ink-dim)]">You lock</div>
              <div className="tnum font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">{CURRENCY}{currentPrice * qty}</div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
              <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-8 place-items-center rounded-full hover:bg-[var(--accent)]"><Minus className="size-4" /></button>
              <span className="tnum w-6 text-center">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(listing.qty_remaining, q + 1))} className="grid size-8 place-items-center rounded-full hover:bg-[var(--accent)] disabled:opacity-40" disabled={qty >= listing.qty_remaining}><Plus className="size-4" /></button>
            </div>
          </div>
          <MagneticButton
            onClick={() => navigate(`/reserve/${listing.id}?qty=${qty}`)}
            className="shrink-0 whitespace-nowrap px-5 text-sm sm:text-base"
            strength={0.25}
          >
            Reserve<span className="hidden sm:inline"> at this price</span>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
