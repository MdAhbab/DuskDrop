/**
 * DuskDrop API client — typed fetch wrapper for the FastAPI backend.
 * Base URL is configured via VITE_API_URL (defaults to http://localhost:8000).
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

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

export function getListings(filters: ListingsFilter = {}): Promise<Listing[]> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") {
      params.append(k, String(v));
    }
  }
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<Listing[]>(`/api/listings${qs}`);
}

export function getListing(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${id}`);
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

export function getVendors(): Promise<Vendor[]> {
  return apiFetch<Vendor[]>("/api/vendors");
}

export function getVendor(id: string): Promise<Vendor> {
  return apiFetch<Vendor>(`/api/vendors/${id}`);
}

export function getVendorListings(vendorId: string): Promise<Listing[]> {
  return getListings({ vendor_id: vendorId });
}

// ── Reservations ──────────────────────────────────────────────────────────────

export function createReservation(body: {
  listing_id: string;
  qty: number;
  buyer_id?: string;
}): Promise<Reservation> {
  return apiFetch<Reservation>("/api/reservations", {
    method: "POST",
    body: JSON.stringify({ buyer_id: "b1", ...body }),
  });
}

export function getReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservations/${id}`);
}

export function payReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservations/${id}/pay`, { method: "POST" });
}

export function collectReservation(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservations/${id}/collect`, { method: "POST" });
}

// ── Impact ────────────────────────────────────────────────────────────────────

export function getMyImpact(buyer_id = "b1"): Promise<ImpactStats> {
  return apiFetch<ImpactStats>(`/api/impact/me?buyer_id=${buyer_id}`);
}

export function getWardImpact(wardCode: string) {
  return apiFetch(`/api/impact/ward/${wardCode}`);
}

// ── Flock Alerts ──────────────────────────────────────────────────────────────

export function getAlerts(buyer_id = "b1"): Promise<FlockAlert[]> {
  return apiFetch<FlockAlert[]>(`/api/flock-alerts?buyer_id=${buyer_id}`);
}

export interface AlertCreateBody {
  category?: string;
  radius_m?: number;
  after_time?: string;
  target_price?: number;
  auto_reserve?: boolean;
}

export function createAlert(body: AlertCreateBody): Promise<FlockAlert> {
  return apiFetch<FlockAlert>("/api/flock-alerts", {
    method: "POST",
    body: JSON.stringify({ buyer_id: "b1", ...body }),
  });
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
