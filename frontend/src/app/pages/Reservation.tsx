import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Clock3, MapPin, Navigation, Leaf, Check, ArrowLeft, Flame } from "lucide-react";
import { CURRENCY, fmtCountdown } from "../lib/data";
import { useClock } from "../lib/theme";
import { CountdownRing } from "../components/dusk/CountdownRing";
import { MagneticButton } from "../components/dusk/MagneticButton";
import * as api from "../lib/api";
import NotFound from "./NotFound";

function QrCode({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    const n = 21;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = () => {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      return h / 0x7fffffff;
    };
    return Array.from({ length: n * n }, () => rand() > 0.5);
  }, [seed]);
  const n = 21;
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-full" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        if (finder(x, y)) return null;
        return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#14100e" /> : null;
      })}
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([fx, fy], k) => (
        <g key={k}>
          <rect x={fx} y={fy} width={7} height={7} fill="#14100e" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="#fff" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#ff6a3d" />
        </g>
      ))}
    </svg>
  );
}

export default function Reservation() {
  useClock(1000);
  const { id } = useParams();
  const [sp] = useSearchParams();
  const qty = Number(sp.get("qty") ?? 1);

  const [reservation, setReservation] = useState<api.Reservation | null>(null);
  const [listing, setListing] = useState<api.Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collected, setCollected] = useState(false);

  useEffect(() => {
    if (!id) return;
    // First fetch the listing to show info, then create a reservation
    api.getListing(id)
      .then((l) => {
        setListing(l);
        return api.createReservation({ listing_id: id, qty });
      })
      .then((r) => {
        setReservation(r);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCollect() {
    if (!reservation) return;
    try {
      await api.collectReservation(reservation.id);
      setCollected(true);
    } catch {
      setCollected(true); // optimistic for demo
    }
  }

  if (notFound) return <NotFound />;
  if (loading || !listing || !reservation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ember)] border-t-transparent" />
      </div>
    );
  }

  const vendor = listing.vendor;
  const locked = reservation.locked_price;
  const code = reservation.qr_code;
  const msClose = listing.ms_until_close;
  const totalMs = new Date(listing.expiry_time).getTime() - new Date(listing.list_time).getTime();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-6">
      <Link to={`/listing/${listing.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <AnimatePresence mode="wait">
        {!collected ? (
          <motion.div key="qr" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="mt-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--success)]/12 px-3 py-1 text-sm text-[var(--success)]">
                <Check className="size-4" /> Reserved · price locked
              </div>
              <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-[var(--ink)]">Show this at pickup</h1>
              <p className="mt-1 text-[var(--ink-dim)]">{vendor?.name} · {qty} × {listing.title}</p>
            </div>

            <div className="mx-auto mt-8 max-w-sm rounded-[2rem] border border-[var(--border)] bg-[var(--bg-elev)] p-6 shadow-dusk">
              <div className="mx-auto aspect-square w-56 overflow-hidden rounded-2xl bg-white p-3">
                <QrCode seed={code} />
              </div>
              <div className="mt-4 text-center">
                <div className="tnum text-sm tracking-widest text-[var(--ink-dim)]">{code}</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--ink-dim)]">Locked price</span>
                  <span className="tnum font-display text-2xl font-semibold text-[var(--ink)]">{CURRENCY}{locked}</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 grid max-w-sm gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-4">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--ink-dim)]"><Clock3 className="size-4" /> Pickup window</span>
                <span className="text-[var(--ink)]">{listing.pickup_window_label}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-4">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--ink-dim)]"><MapPin className="size-4" /> {vendor?.address}</span>
                <a className="inline-flex items-center gap-1 text-sm text-[var(--amber)]" href="#"><Navigation className="size-4" /> Directions</a>
              </div>
              <div className="flex items-center justify-center">
                <CountdownRing remainingMs={msClose} totalMs={totalMs} size={92} label="collect within" />
              </div>
            </div>

            {/* impact preview */}
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/8 p-4">
              <Leaf className="size-5 text-[var(--success)]" />
              <p className="text-sm text-[var(--ink)]">You're about to save <strong>~1.2 kg</strong> of food — about <strong>3 meals</strong> — from going to waste.</p>
            </div>

            <div className="mx-auto mt-6 max-w-sm">
              <MagneticButton className="w-full" onClick={handleCollect}>
                I've collected my order
              </MagneticButton>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="mx-auto grid size-24 place-items-center rounded-full dusk-gradient shadow-ember"
            >
              <Check className="size-12 text-[var(--bg)]" />
            </motion.div>
            <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-[var(--ink)]">Rescued.</h1>
            <p className="mx-auto mt-2 max-w-md text-[var(--ink-dim)]">
              That's <strong>3 meals</strong> and <strong>1.2 kg</strong> kept out of the bin. Your rescue streak just grew.
            </p>
            <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-5">
              <Flame className="size-7 text-[var(--ember)]" />
              <div className="text-left">
                <div className="font-display text-2xl text-[var(--ink)]">Streak growing!</div>
                <div className="text-sm text-[var(--ink-dim)]">+1 from this rescue</div>
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/impact"><MagneticButton variant="outline">See your impact</MagneticButton></Link>
              <Link to="/discover"><MagneticButton>Rescue more</MagneticButton></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
