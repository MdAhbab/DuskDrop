/**
 * DuskDrop — shared client-side pricing utilities.
 *
 * The static mock data arrays (listings, vendors, etc.) have been removed;
 * real data now comes from the FastAPI backend via src/app/lib/api.ts.
 *
 * The decay-price functions below are kept for smooth client-side ticking.
 * The server is the source of truth at reservation-lock time.
 */

import type { Listing as ApiListing } from "./api";

export type DecayCurve = "linear" | "stepped" | "exp";
export type Category =
  | "Bakery"
  | "Cafe"
  | "Grocery"
  | "Restaurant"
  | "Dessert"
  | "Sushi";

export const CURRENCY = "৳";
export const ALL_CATEGORIES: Category[] = ["Bakery", "Cafe", "Grocery", "Restaurant", "Dessert", "Sushi"];
export const DIETARY_TAGS = ["Vegan", "Vegetarian", "Gluten-free", "Halal", "Pescatarian"];

// ---- client-side decay engine (mirrors backend pricing.py) -----------------

function curveFactor(curve: DecayCurve, p: number): number {
  switch (curve) {
    case "linear":
      return p;
    case "exp":
      return Math.pow(p, 2.1);
    case "stepped": {
      const steps = 5;
      return Math.floor(p * steps) / steps;
    }
  }
}

/**
 * Build a decay price series from an API listing.
 * Used for client-side sparklines in ListingDetail.
 */
export function decay_series_from_listing(
  listing: ApiListing,
  points = 40
): { t: number; price: number }[] {
  const start = new Date(listing.list_time).getTime();
  const end = new Date(listing.expiry_time).getTime();
  const total = end - start;
  if (total <= 0) return [];
  return Array.from({ length: points }, (_, i) => {
    const frac = i / (points - 1);
    const t = start + total * frac;
    const p = frac;
    const price = Math.max(
      1,
      Math.round(
        listing.original_price *
          (1 - listing.max_discount * curveFactor(listing.decay_curve, p))
      )
    );
    return { t, price };
  });
}

export function currentPrice(listing: ApiListing, nowMs = Date.now()): number {
  const start = new Date(listing.list_time).getTime();
  const end = new Date(listing.expiry_time).getTime();
  const total = end - start;
  if (total <= 0) return listing.original_price;

  const elapsed = Math.max(0, nowMs - start);
  const p = Math.min(1, Math.max(0, elapsed / total));

  const discount = listing.max_discount * curveFactor(listing.decay_curve, p);
  return Math.max(1, Math.round(listing.original_price * (1 - discount)));
}

export function discountPct(listing: ApiListing, nowMs = Date.now()): number {
  const p = currentPrice(listing, nowMs);
  return Math.round((1 - p / listing.original_price) * 100);
}

// ---- time utils ------------------------------------------------------------

export function fmtCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function money(n: number) {
  return `${CURRENCY}${n.toLocaleString("en-IN")}`;
}
