"""
SQLAlchemy ORM models for DuskDrop marketplace.
Data model as specified in README §4.
"""
import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from .database import Base


def _now():
    return datetime.now(timezone.utc)


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False)          # e.g. "Artisan bakery"
    address = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    rating = Column(Float, default=4.5)
    logo = Column(String, default="🏪")            # emoji glyph
    hours_json = Column(Text, default="{}")
    logo_url = Column(String, nullable=True)
    payout_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)

    listings = relationship("Listing", back_populates="vendor")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, nullable=False)       # Bakery/Cafe/Grocery/…
    photos_json = Column(Text, default="[]")        # JSON list of image URLs
    allergens_json = Column(Text, default="[]")     # JSON list of strings
    dietary_json = Column(Text, default="[]")       # JSON list of strings

    original_price = Column(Integer, nullable=False)   # in smallest currency unit
    currency = Column(String, default="BDT")
    qty_total = Column(Integer, nullable=False)
    qty_remaining = Column(Integer, nullable=False)

    # Timing (stored as real UTC datetimes)
    list_time = Column(DateTime, nullable=False)
    expiry_time = Column(DateTime, nullable=False)
    pickup_window_start = Column(DateTime, nullable=True)
    pickup_window_end = Column(DateTime, nullable=True)
    pickup_window_label = Column(String, default="")   # human label e.g. "Today · 19:30–20:00"

    # Decay pricing
    max_discount = Column(Float, default=0.6)        # fraction, e.g. 0.68 → 68%
    decay_curve = Column(
        Enum("linear", "stepped", "exp", name="decay_curve_enum"),
        default="linear",
    )
    decay_params_json = Column(Text, default="{}")

    # Surprise bag extras
    is_surprise_bag = Column(Boolean, default=False)
    value_low = Column(Integer, nullable=True)
    value_high = Column(Integer, nullable=True)

    # Location hint (duplicate of vendor for fast queries)
    distance_m = Column(Integer, default=0)       # metres from city centre
    walk_min = Column(Integer, default=0)

    status = Column(
        Enum("active", "sold_out", "expired", "withdrawn", name="listing_status_enum"),
        default="active",
    )

    created_at = Column(DateTime, default=_now)

    vendor = relationship("Vendor", back_populates="listings")
    reservations = relationship("Reservation", back_populates="listing")
    price_samples = relationship("PriceSample", back_populates="listing")

    # ---- helpers ----
    @property
    def photos(self) -> list:
        return json.loads(self.photos_json or "[]")

    @property
    def allergens(self) -> list:
        return json.loads(self.allergens_json or "[]")

    @property
    def dietary(self) -> list:
        return json.loads(self.dietary_json or "[]")


class PriceSample(Base):
    """Historical price samples for sparklines / audit."""
    __tablename__ = "price_samples"

    id = Column(Integer, primary_key=True, autoincrement=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    sampled_at = Column(DateTime, default=_now)
    computed_price = Column(Integer, nullable=False)

    listing = relationship("Listing", back_populates="price_samples")


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    home_lat = Column(Float, default=0.0)
    home_lng = Column(Float, default=0.0)
    prefs_json = Column(Text, default="{}")
    streak_days = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=_now)

    reservations = relationship("Reservation", back_populates="buyer")
    impact_events = relationship("ImpactEvent", back_populates="buyer")
    flock_alerts = relationship("FlockAlert", back_populates="buyer")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("buyers.id"), nullable=False)
    qty = Column(Integer, default=1)
    locked_price = Column(Integer, nullable=False)   # price locked at reservation time
    qr_code = Column(String, nullable=False, unique=True)

    status = Column(
        Enum("held", "paid", "collected", "expired", "cancelled", name="reservation_status_enum"),
        default="held",
    )

    created_at = Column(DateTime, default=_now)
    collected_at = Column(DateTime, nullable=True)

    listing = relationship("Listing", back_populates="reservations")
    buyer = relationship("Buyer", back_populates="reservations")
    impact_event = relationship("ImpactEvent", back_populates="reservation", uselist=False)


class ImpactEvent(Base):
    __tablename__ = "impact_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("buyers.id"), nullable=False)
    meals_saved = Column(Float, default=0.0)
    grams_diverted = Column(Float, default=0.0)
    co2e_grams = Column(Float, default=0.0)
    ward_code = Column(String, default="dhk-01")
    created_at = Column(DateTime, default=_now)

    reservation = relationship("Reservation", back_populates="impact_event")
    buyer = relationship("Buyer", back_populates="impact_events")


class FlockAlert(Base):
    __tablename__ = "flock_alerts"

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, ForeignKey("buyers.id"), nullable=False)
    category = Column(String, default="Anything")   # category or "Anything"
    radius_m = Column(Integer, default=1000)
    after_time = Column(String, default="18:00")     # "HH:MM"
    target_price = Column(Integer, default=500)
    auto_reserve = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_now)

    buyer = relationship("Buyer", back_populates="flock_alerts")


class HostSite(Base):
    """Module-mode host sites."""
    __tablename__ = "host_sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    api_key = Column(String, nullable=False, unique=True)
    theme_tokens_json = Column(Text, default="{}")
    webhook_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)
