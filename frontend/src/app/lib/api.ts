/**
 * DuskDrop API client — typed fetch wrapper for the FastAPI backend.
 * Base URL is configured via VITE_API_URL (defaults to http://localhost:8000).
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// On the public Vercel demo there is no backend, so reads fall back to baked-in
// snapshots (see fallback.ts) — the marketplace renders fully without a server.
import { FALLBACK_LISTINGS, FALLBACK_VENDORS, FALLBACK_IMPACT, FALLBACK_ALERTS } from "./fallback";

// ── Types (mirroring backend schemas) ─────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  kind: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  logo: string;
}

export interface Listing {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
  allergens: string[];
  dietary: string[];
  original_price: number;
  currency: string;
  qty_total: number;
  qty_remaining: number;
  list_time: string;       // ISO datetime
  expiry_time: string;     // ISO datetime
  pickup_window_label: string;
  max_discount: number;
  decay_curve: "linear" | "stepped" | "exp";
  is_surprise_bag: boolean;
  value_low?: number;
  value_high?: number;
  distance_m: number;
  walk_min: number;
  status: "active" | "sold_out" | "expired" | "withdrawn";

  // Computed fields (populated by routers)
  current_price: number;
  discount_pct: number;
  ms_until_close: number;
  vendor?: Vendor;
}

export interface ListingPrice {
  id: string;
  current_price: number;
  discount_pct: number;
  ms_until_close: number;
  status: string;
}

export interface Reservation {
  id: string;
  listing_id: string;
  buyer_id: string;
  qty: number;
  locked_price: number;
  qr_code: string;
  status: "held" | "paid" | "collected" | "expired" | "cancelled";
  created_at: string;
  collected_at?: string;
  listing?: Listing;
}

export interface WeeklyPoint {
  day: string;
  meals: number;
}

export interface LeaderboardEntry {
  name: string;
  meals: number;
  you: boolean;
}

export interface ImpactStats {
  meals_rescued_global: number;
  my_meals: number;
  my_kg: number;
  my_co2e_kg: number;
  streak_days: number;
  best_streak: number;
  rank_ward: number;
  ward_name: string;
  weekly: WeeklyPoint[];
  leaderboard: LeaderboardEntry[];
}

export interface FlockAlert {
  id: string;
  buyer_id: string;
  category: string;
  radius_m: number;
  after_time: string;
  target_price: number;
  auto_reserve: boolean;
  active: boolean;
}

export interface ListingDraft {
  title: string;
  description: string;
  category: string;
  allergens: string[];
  suggested_original_price: number;
  suggested_curve: "linear" | "stepped" | "exp";
  suggested_max_discount: number;
  confidence: number;
}

export interface ForecastNudge {
  title: string;
  detail: string;
  confidence: string;
}

export interface Forecast {
  vendor_id: string;
  nudges: ForecastNudge[];
}

export interface ConciergeResult {
  listings: Listing[];
  rationale: string;
}

// ── Utility ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Listings ──────────────────────────────────────────────────────────────────

export interface ListingsFilter {
  category?: string;
  max_price?: number;
  closing_within_min?: number;
  dietary?: string;
  is_surprise_bag?: boolean;
  vendor_id?: string;
}

export async function getListings(filters: ListingsFilter = {}): Promise<Listing[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") {
      params.append(k, String(v));
    }
  }
  const qs = params.toString() ? `?${params.toString()}` : "";
  try {
    return await apiFetch<Listing[]>(`/api/listings${qs}`);
  } catch {
    let list = FALLBACK_LISTINGS;
    if (filters.category) list = list.filter((l) => l.category === filters.category);
    if (filters.is_surprise_bag !== undefined) list = list.filter((l) => l.is_surprise_bag === filters.is_surprise_bag);
    if (filters.vendor_id) list = list.filter((l) => l.vendor_id === filters.vendor_id);
    return list;
  }
}

export async function getListing(id: string): Promise<Listing> {
  try {
    return await apiFetch<Listing>(`/api/listings/${id}`);
  } catch {
    const f = FALLBACK_LISTINGS.find((l) => l.id === id);
    if (f) return f;
    throw new Error("Listing not found");
  }
}

export function getListingPrice(id: string): Promise<ListingPrice> {
  return apiFetch<ListingPrice>(`/api/listings/${id}/price`);
}

export interface ListingCreateBody {
  vendor_id: string;
  title: string;
  description?: string;
  category: string;
  photos?: string[];
  allergens?: string[];
  dietary?: string[];
  original_price: number;
  qty_total: number;
  pickup_window_label?: string;
  max_discount?: number;
  decay_curve?: string;
  is_surprise_bag?: boolean;
  value_low?: number;
  value_high?: number;
  expires_in_min?: number;
}

export function createListing(body: ListingCreateBody): Promise<Listing> {
  return apiFetch<Listing>("/api/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Vendors ───────────────────────────────────────────────────────────────────

export async function getVendors(): Promise<Vendor[]> {
  try {
    return await apiFetch<Vendor[]>("/api/vendors");
  } catch {
    return FALLBACK_VENDORS;
  }
}

export async function getVendor(id: string): Promise<Vendor> {
  try {
    return await apiFetch<Vendor>(`/api/vendors/${id}`);
  } catch {
    const f = FALLBACK_VENDORS.find((v) => v.id === id);
    if (f) return f;
    throw new Error("Vendor not found");
  }
}

export function getVendorListings(vendorId: string): Promise<Listing[]> {
  return getListings({ vendor_id: vendorId });
}

// ── Reservations ──────────────────────────────────────────────────────────────

// Build a plausible local reservation so the reserve→QR→collect flow works on
// the backend-less public demo. Mirrors the server's QR + price-lock behaviour.
function localReservation(listing_id: string, qty: number, buyer_id: string): Reservation {
  const fallback = FALLBACK_LISTINGS.find((l) => l.id === listing_id);
  const unit = fallback?.current_price ?? 0;
  const slug = Math.random().toString(36).slice(2, 6).toUpperCase();
  return {
    id: `local-${slug}`,
    listing_id,
    buyer_id,
    qty,
    locked_price: unit * qty,
    qr_code: `DD-${listing_id.toUpperCase()}-${slug}`,
    status: "held",
    created_at: new Date().toISOString(),
    listing: fallback,
  };
}

export async function createReservation(body: {
  listing_id: string;
  qty: number;
  buyer_id?: string;
}): Promise<Reservation> {
  const buyer_id = body.buyer_id ?? "b1";
  try {
    return await apiFetch<Reservation>("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ buyer_id, ...body }),
    });
  } catch {
    return localReservation(body.listing_id, body.qty, buyer_id);
  }
}

export function getReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservations/${id}`);
}

export async function payReservation(id: string): Promise<Reservation> {
  try {
    return await apiFetch<Reservation>(`/api/reservations/${id}/pay`, { method: "POST" });
  } catch {
    return { id, listing_id: "", buyer_id: "b1", qty: 1, locked_price: 0, qr_code: "", status: "paid", created_at: new Date().toISOString() };
  }
}

export async function collectReservation(id: string): Promise<Reservation> {
  try {
    return await apiFetch<Reservation>(`/api/reservations/${id}/collect`, { method: "POST" });
  } catch {
    return { id, listing_id: "", buyer_id: "b1", qty: 1, locked_price: 0, qr_code: "", status: "collected", created_at: new Date().toISOString(), collected_at: new Date().toISOString() };
  }
}

// ── Impact ────────────────────────────────────────────────────────────────────

export async function getMyImpact(buyer_id = "b1"): Promise<ImpactStats> {
  try {
    return await apiFetch<ImpactStats>(`/api/impact/me?buyer_id=${buyer_id}`);
  } catch {
    return FALLBACK_IMPACT;
  }
}

export function getWardImpact(wardCode: string) {
  return apiFetch(`/api/impact/ward/${wardCode}`);
}

// ── Flock Alerts ──────────────────────────────────────────────────────────────

export async function getAlerts(buyer_id = "b1"): Promise<FlockAlert[]> {
  try {
    return await apiFetch<FlockAlert[]>(`/api/flock-alerts?buyer_id=${buyer_id}`);
  } catch {
    return FALLBACK_ALERTS;
  }
}

export interface AlertCreateBody {
  category?: string;
  radius_m?: number;
  after_time?: string;
  target_price?: number;
  auto_reserve?: boolean;
}

export async function createAlert(body: AlertCreateBody): Promise<FlockAlert> {
  try {
    return await apiFetch<FlockAlert>("/api/flock-alerts", {
      method: "POST",
      body: JSON.stringify({ buyer_id: "b1", ...body }),
    });
  } catch {
    // Offline demo: synthesise a local alert so the form still responds.
    return {
      id: `local-${Math.random().toString(36).slice(2, 8)}`,
      buyer_id: "b1",
      category: body.category ?? "Anything",
      radius_m: body.radius_m ?? 1000,
      after_time: body.after_time ?? "18:00",
      target_price: body.target_price ?? 500,
      auto_reserve: body.auto_reserve ?? false,
      active: true,
    };
  }
}

export function patchAlert(id: string, body: Partial<AlertCreateBody & { active: boolean }>): Promise<FlockAlert> {
  return apiFetch<FlockAlert>(`/api/flock-alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAlert(id: string): Promise<void> {
  return apiFetch<void>(`/api/flock-alerts/${id}`, { method: "DELETE" });
}

// ── Agents ────────────────────────────────────────────────────────────────────

export function draftListing(): Promise<ListingDraft> {
  return apiFetch<ListingDraft>("/api/agents/listing-draft", { method: "POST" });
}

export function getForecast(vendorId: string): Promise<Forecast> {
  return apiFetch<Forecast>(`/api/agents/forecast/${vendorId}`);
}

export function queryConcierge(body: {
  query: string;
  lat?: number;
  lng?: number;
}): Promise<ConciergeResult> {
  return apiFetch<ConciergeResult>("/api/agents/concierge", {
    method: "POST",
    body: JSON.stringify({ buyer_id: "b1", ...body }),
  });
}
