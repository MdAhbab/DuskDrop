"""
Pydantic v2 schemas for DuskDrop API request/response validation.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ── Vendor ────────────────────────────────────────────────────────────────────

class VendorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    kind: str
    address: str
    lat: float
    lng: float
    rating: float
    logo: str


# ── Listing ───────────────────────────────────────────────────────────────────

class ListingOut(BaseModel):
    """Full listing with computed pricing fields."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    vendor_id: str
    title: str
    description: str
    category: str
    photos: List[str]
    allergens: List[str]
    dietary: List[str]
    original_price: int
    currency: str
    qty_total: int
    qty_remaining: int
    list_time: datetime
    expiry_time: datetime
    pickup_window_label: str
    max_discount: float
    decay_curve: str
    is_surprise_bag: bool
    value_low: Optional[int]
    value_high: Optional[int]
    distance_m: int
    walk_min: int
    status: str

    # Computed fields (populated by routers)
    current_price: int = 0
    discount_pct: int = 0
    ms_until_close: int = 0
    vendor: Optional[VendorOut] = None


class ListingCreate(BaseModel):
    vendor_id: str
    title: str
    description: str = ""
    category: str
    photos: List[str] = []
    allergens: List[str] = []
    dietary: List[str] = []
    original_price: int
    qty_total: int
    pickup_window_label: str = ""
    max_discount: float = 0.6
    decay_curve: str = "linear"
    is_surprise_bag: bool = False
    value_low: Optional[int] = None
    value_high: Optional[int] = None
    # How many minutes from now until the listing expires
    expires_in_min: int = 120


class ListingPriceOut(BaseModel):
    id: str
    current_price: int
    discount_pct: int
    ms_until_close: int
    status: str


# ── Reservation ───────────────────────────────────────────────────────────────

class ReservationCreate(BaseModel):
    listing_id: str
    qty: int = 1
    buyer_id: str = "b1"   # demo buyer — auth layer future milestone


class ReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    listing_id: str
    buyer_id: str
    qty: int
    locked_price: int
    qr_code: str
    status: str
    created_at: datetime
    collected_at: Optional[datetime]

    listing: Optional[ListingOut] = None


# ── Impact ────────────────────────────────────────────────────────────────────

class WeeklyPoint(BaseModel):
    day: str
    meals: float


class LeaderboardEntry(BaseModel):
    name: str
    meals: float
    you: bool


class ImpactOut(BaseModel):
    meals_rescued_global: int
    my_meals: float
    my_kg: float
    my_co2e_kg: float
    streak_days: int
    best_streak: int
    rank_ward: int
    ward_name: str
    weekly: List[WeeklyPoint]
    leaderboard: List[LeaderboardEntry]


class WardImpactOut(BaseModel):
    ward_code: str
    total_meals: float
    total_kg: float
    total_co2e_kg: float


# ── Flock Alerts ──────────────────────────────────────────────────────────────

class FlockAlertCreate(BaseModel):
    category: str = "Anything"
    radius_m: int = 1000
    after_time: str = "18:00"
    target_price: int = 500
    auto_reserve: bool = False
    buyer_id: str = "b1"


class FlockAlertPatch(BaseModel):
    category: Optional[str] = None
    radius_m: Optional[int] = None
    after_time: Optional[str] = None
    target_price: Optional[int] = None
    auto_reserve: Optional[bool] = None
    active: Optional[bool] = None


class FlockAlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    buyer_id: str
    category: str
    radius_m: int
    after_time: str
    target_price: int
    auto_reserve: bool
    active: bool


# ── Agents ────────────────────────────────────────────────────────────────────

class ListingDraftOut(BaseModel):
    title: str
    description: str
    category: str
    allergens: List[str]
    suggested_original_price: int
    suggested_curve: str
    suggested_max_discount: float
    confidence: float


class ForecastNudge(BaseModel):
    title: str
    detail: str
    confidence: str


class ForecastOut(BaseModel):
    vendor_id: str
    nudges: List[ForecastNudge]


class ConciergeQuery(BaseModel):
    query: str
    lat: float = 0.0
    lng: float = 0.0
    buyer_id: str = "b1"


class ConciergeOut(BaseModel):
    listings: List[ListingOut]
    rationale: str
