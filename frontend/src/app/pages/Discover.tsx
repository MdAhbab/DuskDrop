import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, SlidersHorizontal, MapPin, Footprints, X, Search } from "lucide-react";
import {
  ALL_CATEGORIES,
  DIETARY_TAGS,
  CURRENCY,
  fmtCountdown,
  type Category,
} from "../lib/data";
import { useClock } from "../lib/theme";
import { Slider } from "../components/ui/slider";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import * as api from "../lib/api";
import { queryConcierge } from "../lib/api";

export default function Discover() {
  useClock(1000);
  const [cats, setCats] = useState<Category[]>([]);
  const [diet, setDiet] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [closingWithin, setClosingWithin] = useState(180);
  const [query, setQuery] = useState("");
  const [concierge, setConcierge] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<api.Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [conciergeResult, setConciergeResult] = useState<api.Listing[] | null>(null);

  // Fetch listings from API whenever filters change
  useEffect(() => {
    setLoading(true);
    api
      .getListings({
        category: cats.length === 1 ? cats[0] : undefined,
        max_price: maxPrice < 1000 ? maxPrice : undefined,
        closing_within_min: closingWithin < 180 ? closingWithin : undefined,
        dietary: diet.length === 1 ? diet[0] : undefined,
      })
      .then((data) => {
        setListings(data);
        if (data.length > 0 && !active) {
          setActive(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats, diet, maxPrice, closingWithin]);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const displayListings = conciergeResult ?? listings;

  // Client-side text filter (concierge bypass for simple keyword search)
  const filtered = useMemo(() => {
    if (!query || conciergeResult) return displayListings;
    const q = query.toLowerCase();
    return displayListings.filter(
      (l) =>
        `${l.title} ${l.description} ${l.vendor?.name ?? ""}`.toLowerCase().includes(q)
    );
  }, [displayListings, query, conciergeResult]);

  async function askConcierge(q: string) {
    if (!q.trim()) return;
    setConcierge(q);
    try {
      const result = await queryConcierge({ query: q });
      setConciergeResult(result.listings);
      if (result.listings.length > 0) setActive(result.listings[0].id);
    } catch {
      // fall back to client-side filter
      setConciergeResult(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-0 px-0 lg:grid-cols-[minmax(360px,460px)_1fr]">
      {/* -------- left rail (desktop) / list -------- */}
      <aside className="order-2 flex flex-col border-r border-[var(--border)] lg:order-1 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)]">
        <div className="space-y-3 border-b border-[var(--border)] bg-[var(--bg)]/60 p-4 backdrop-blur-md">
          <h1 className="font-display text-2xl text-[var(--ink)]">Discover near you</h1>

          {/* Ask DuskDrop concierge */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              askConcierge(query);
            }}
            className="relative"
          >
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--amber)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={'Ask DuskDrop — "dinner for 2 under ৳300, gluten-free, closing soon"'}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elev)] py-2.5 pl-9 pr-10 text-sm text-[var(--ink)] outline-none ease-dusk focus:border-[var(--amber)]"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--ember)] text-white">
              <Search className="size-3.5" />
            </button>
          </form>

          {concierge && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--amber)]/30 bg-[var(--amber)]/8 p-3 text-sm text-[var(--ink)]">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--amber)]" />
              <div>
                <span className="text-[var(--amber)]">DuskDrop concierge</span>
                <p className="mt-0.5 text-[var(--ink-dim)]">
                  Found {filtered.length} matches for "{concierge}".
                </p>
              </div>
              <button
                onClick={() => {
                  setConcierge(null);
                  setConciergeResult(null);
                }}
                className="ml-auto text-[var(--ink-dim)]"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* category chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((c) => (
              <Chip key={c} active={cats.includes(c)} onClick={() => toggle(cats, c, setCats)}>
                {c}
              </Chip>
            ))}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--ink-dim)] hover:text-[var(--ink)]"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-sm text-[var(--ink-dim)]">
                      <span>Max price</span>
                      <span className="tnum text-[var(--ink)]">{CURRENCY}{maxPrice}</span>
                    </div>
                    <Slider value={[maxPrice]} min={100} max={1000} step={20} onValueChange={([v]) => setMaxPrice(v)} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-[var(--ink-dim)]">
                      <span>Closing within</span>
                      <span className="tnum text-[var(--ink)]">{closingWithin} min</span>
                    </div>
                    <Slider value={[closingWithin]} min={15} max={180} step={15} onValueChange={([v]) => setClosingWithin(v)} className="mt-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_TAGS.map((d) => (
                      <Chip key={d} active={diet.includes(d)} onClick={() => toggle(diet, d, setDiet)} small>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
          <div className="text-sm text-[var(--ink-dim)]">
            {loading ? "Loading listings…" : `${filtered.length} listings · prices ticking`}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-[var(--bg-elev)]" />
              ))}
            </div>
          ) : (
            filtered.map((l) => (
              <SheetCard key={l.id} listing={l} active={active === l.id} onHover={() => setActive(l.id)} />
            ))
          )}
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
              <div className="text-3xl">🌅</div>
              <div className="mt-2 font-display text-lg text-[var(--ink)]">The sun's still up</div>
              <p className="mt-1 text-sm text-[var(--ink-dim)]">Nothing matches yet — check back nearer closing time, or widen your filters.</p>
            </div>
          )}
        </div>
      </aside>

      {/* -------- map -------- */}
      <div className="relative order-1 h-[42vh] lg:order-2 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
        <DuskMap listings={filtered} active={active} onSelect={setActive} />
      </div>
    </div>
  );
}

function Chip({ children, active, onClick, small }: { children: React.ReactNode; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border ease-dusk transition-colors ${small ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
        active
          ? "border-transparent bg-[var(--ember)] text-white"
          : "border-[var(--border)] text-[var(--ink-dim)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function SheetCard({ listing: l, active, onHover }: { listing: api.Listing; active: boolean; onHover: () => void }) {
  const vendor = l.vendor;
  return (
    <Link
      to={`/listing/${l.id}`}
      onMouseEnter={onHover}
      className={`flex gap-3 rounded-2xl border p-2.5 ease-dusk transition-all ${
        active ? "border-[var(--ember)] bg-[var(--bg-elev)] shadow-dusk" : "border-[var(--border)] bg-[var(--bg-elev)]/60 hover:border-[var(--amber)]"
      }`}
    >
      <ImageWithFallback src={l.photos[0] ?? ""} alt={l.title} className="size-20 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-[var(--ink-dim)]">
          <span>{vendor?.logo ?? "🏪"}</span>{vendor?.name ?? ""}
        </div>
        <div className="truncate font-display text-[var(--ink)]">{l.title}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="tnum font-display text-lg text-[var(--ink)]">{CURRENCY}{l.current_price}</span>
          <span className="tnum text-xs text-[var(--ink-dim)] line-through">{CURRENCY}{l.original_price}</span>
          <span className="rounded-full bg-[var(--amber)]/15 px-1.5 text-xs text-[var(--amber)]">−{l.discount_pct}%</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--ink-dim)]">
          <span className="inline-flex items-center gap-1"><Footprints className="size-3" />{l.walk_min}m</span>
          <span className="inline-flex items-center gap-1 tnum text-[var(--ember)]">{fmtCountdown(l.ms_until_close)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ---- synthetic warm "dusk" map (MapLibre stand-in) ---- */
function DuskMap({ listings: items, active, onSelect }: { listings: api.Listing[]; active: string | null; onSelect: (id: string) => void }) {
  useClock(1000);
  return (
    <div className="absolute inset-0 overflow-hidden lg:rounded-none">
      {/* warm muted map base */}
      <div className="absolute inset-0 bg-[var(--bg-elev)]" />
      <div className="absolute inset-0 opacity-[0.5]" style={{ background: "radial-gradient(110% 80% at 70% 10%, rgba(255,140,77,0.18), transparent 60%)" }} />
      {/* roads */}
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
        <g stroke="var(--ink-dim)" strokeOpacity="0.18" strokeWidth="10" fill="none">
          <path d="M-50 220 Q 400 120 900 320" />
          <path d="M120 -50 Q 260 300 200 900" />
          <path d="M700 -50 Q 600 360 760 900" />
          <path d="M-50 540 Q 420 480 950 600" />
        </g>
        <g stroke="var(--ink-dim)" strokeOpacity="0.1" strokeWidth="4" fill="none">
          <path d="M-50 360 Q 400 320 950 420" />
          <path d="M400 -50 L 420 900" />
        </g>
      </svg>
      {/* river */}
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path d="M-50 700 Q 300 640 520 720 T 950 700 L 950 900 L -50 900 Z" fill="var(--indigo)" opacity="0.18" />
      </svg>

      {/* pins */}
      {items.map((l) => {
        const urgent = l.ms_until_close < 20 * 60000;
        const isActive = active === l.id;
        // Use vendor lat/lng for pin position or fallback to index
        const pinLat = l.vendor?.lat ?? 50;
        const pinLng = l.vendor?.lng ?? 50;
        return (
          <button
            key={l.id}
            onClick={() => onSelect(l.id)}
            className="group absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${pinLng}%`, top: `${pinLat}%`, zIndex: isActive ? 30 : 10 }}
          >
            <span className="relative grid place-items-center">
              <motion.span
                className="absolute size-10 rounded-full"
                style={{ background: urgent ? "var(--ember)" : "var(--amber)" }}
                animate={{ scale: [1, urgent ? 2 : 1.6, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: urgent ? 1.4 : 2.6, repeat: Infinity }}
              />
              <span
                className={`relative grid place-items-center rounded-full border-2 border-white/80 text-sm shadow-ember ease-dusk transition-transform ${
                  isActive ? "size-11 scale-110" : "size-9"
                }`}
                style={{ background: urgent ? "var(--ember)" : "var(--amber)" }}
              >
                {l.vendor?.logo ?? "🏪"}
              </span>
            </span>
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ink)] px-2.5 py-1 text-xs text-[var(--bg)]"
                >
                  {CURRENCY}{l.current_price} · {fmtCountdown(l.ms_until_close)}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}

      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)]/70 px-3 py-1.5 text-xs text-[var(--ink-dim)] backdrop-blur-md">
        <MapPin className="size-3.5 text-[var(--ember)]" /> Dhanmondi · live map
      </div>
    </div>
  );
}
