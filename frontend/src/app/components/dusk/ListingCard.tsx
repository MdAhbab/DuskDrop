import { Link } from "react-router";
import { motion } from "motion/react";
import { MapPin, Footprints, Clock3, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../custom/ImageWithFallback";
import { TickingPrice } from "./TickingPrice";
import { fmtCountdown } from "../../lib/data";
import { useClock } from "../../lib/theme";
import * as api from "../../lib/api";

export function ListingCard({ listing, index = 0 }: { listing: api.Listing; index?: number }) {
  useClock(1000);
  const vendor = listing.vendor;
  const remaining = listing.ms_until_close;
  const urgent = remaining < 15 * 60 * 1000;
  const soldOut = listing.qty_remaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/listing/${listing.id}`}
        className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] shadow-dusk ease-dusk transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <ImageWithFallback
            src={listing.photos[0] ?? ""}
            alt={listing.title}
            className="size-full object-cover transition-transform duration-700 ease-dusk group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          {/* countdown chip */}
          <div
            className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur-md ${
              urgent ? "bg-[var(--ember)]/90 text-white" : "bg-black/40 text-white"
            }`}
          >
            <Clock3 className="size-3.5" />
            <span className="tnum">{fmtCountdown(remaining)}</span>
          </div>
          {listing.is_surprise_bag && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--indigo)]/80 px-2.5 py-1 text-xs text-white backdrop-blur-md">
              <Sparkles className="size-3.5" /> Surprise
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
            <span className="grid size-7 place-items-center rounded-full bg-white/15 text-sm backdrop-blur">
              {vendor?.logo ?? "🏪"}
            </span>
            <span className="text-sm drop-shadow">{vendor?.name ?? ""}</span>
          </div>
          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 font-display text-xl text-white">
              Sold out
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="font-display leading-tight text-[var(--ink)]">{listing.title}</h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-[var(--ink-dim)]">{listing.description}</p>
          </div>

          <TickingPrice listing={listing} size="md" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-dim)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {(listing.distance_m / 1000).toFixed(1)} km
            </span>
            <span className="inline-flex items-center gap-1">
              <Footprints className="size-3.5" />
              {listing.walk_min} min
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--ink-dim)]">{listing.qty_remaining} left</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--ink-dim)]/15">
              <div
                className="h-full dusk-gradient"
                style={{ width: `${(listing.qty_remaining / listing.qty_total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
