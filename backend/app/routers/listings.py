"""Listings router — GET /api/listings, /api/listings/{id}, /api/listings/{id}/price"""
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Listing, Vendor
from ..schemas import ListingOut, ListingCreate, ListingPriceOut, VendorOut
from ..pricing import current_price, discount_pct, ms_until_close

router = APIRouter(prefix="/api/listings", tags=["listings"])


def _enrich(listing: Listing) -> ListingOut:
    """Attach computed pricing fields to a ListingOut."""
    now = datetime.now(timezone.utc)
    cp = current_price(
        listing.original_price, listing.max_discount, listing.decay_curve,
        listing.list_time, listing.expiry_time, now,
    )
    dp = discount_pct(
        listing.original_price, listing.max_discount, listing.decay_curve,
        listing.list_time, listing.expiry_time, now,
    )
    muc = ms_until_close(listing.expiry_time, now)

    vendor_out = None
    if listing.vendor:
        vendor_out = VendorOut.model_validate(listing.vendor)

    return ListingOut(
        id=listing.id,
        vendor_id=listing.vendor_id,
        title=listing.title,
        description=listing.description,
        category=listing.category,
        photos=listing.photos,
        allergens=listing.allergens,
        dietary=listing.dietary,
        original_price=listing.original_price,
        currency=listing.currency,
        qty_total=listing.qty_total,
        qty_remaining=listing.qty_remaining,
        list_time=listing.list_time,
        expiry_time=listing.expiry_time,
        pickup_window_label=listing.pickup_window_label or "",
        max_discount=listing.max_discount,
        decay_curve=listing.decay_curve,
        is_surprise_bag=listing.is_surprise_bag,
        value_low=listing.value_low,
        value_high=listing.value_high,
        distance_m=listing.distance_m,
        walk_min=listing.walk_min,
        status=listing.status,
        current_price=cp,
        discount_pct=dp,
        ms_until_close=muc,
        vendor=vendor_out,
    )


@router.get("", response_model=List[ListingOut])
def get_listings(
    category: Optional[str] = Query(None),
    max_price: Optional[int] = Query(None),
    closing_within_min: Optional[int] = Query(None),
    dietary: Optional[str] = Query(None),
    is_surprise_bag: Optional[bool] = Query(None),
    vendor_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List active listings with optional filters."""
    q = db.query(Listing).filter(Listing.status == "active")

    if category:
        q = q.filter(Listing.category == category)
    if is_surprise_bag is not None:
        q = q.filter(Listing.is_surprise_bag == is_surprise_bag)
    if vendor_id:
        q = q.filter(Listing.vendor_id == vendor_id)

    listings = q.all()
    now = datetime.now(timezone.utc)

    results = []
    for listing in listings:
        # Expire listings that have passed their expiry time
        if listing.expiry_time.replace(tzinfo=timezone.utc) < now:
            listing.status = "expired"
            db.commit()
            continue

        enriched = _enrich(listing)

        # Filter by computed current price
        if max_price is not None and enriched.current_price > max_price:
            continue

        # Filter by closing window
        if closing_within_min is not None:
            if enriched.ms_until_close > closing_within_min * 60 * 1000:
                continue

        # Filter by dietary tag
        if dietary and dietary not in enriched.dietary:
            continue

        results.append(enriched)

    # Sort: soonest closing first
    results.sort(key=lambda l: l.ms_until_close)
    return results


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _enrich(listing)


@router.get("/{listing_id}/price", response_model=ListingPriceOut)
def get_listing_price(listing_id: str, db: Session = Depends(get_db)):
    """Lightweight price-only endpoint — called every second for live ticking."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    now = datetime.now(timezone.utc)
    return ListingPriceOut(
        id=listing.id,
        current_price=current_price(
            listing.original_price, listing.max_discount, listing.decay_curve,
            listing.list_time, listing.expiry_time, now,
        ),
        discount_pct=discount_pct(
            listing.original_price, listing.max_discount, listing.decay_curve,
            listing.list_time, listing.expiry_time, now,
        ),
        ms_until_close=ms_until_close(listing.expiry_time, now),
        status=listing.status,
    )


@router.post("", response_model=ListingOut, status_code=201)
def create_listing(body: ListingCreate, db: Session = Depends(get_db)):
    """Create a new listing (vendor publish)."""
    now = datetime.now(timezone.utc)
    listing_id = f"l{uuid.uuid4().hex[:8]}"
    listing = Listing(
        id=listing_id,
        vendor_id=body.vendor_id,
        title=body.title,
        description=body.description,
        category=body.category,
        photos_json=json.dumps(body.photos),
        allergens_json=json.dumps(body.allergens),
        dietary_json=json.dumps(body.dietary),
        original_price=body.original_price,
        qty_total=body.qty_total,
        qty_remaining=body.qty_total,
        list_time=now,
        expiry_time=now + timedelta(minutes=body.expires_in_min),
        pickup_window_label=body.pickup_window_label,
        max_discount=body.max_discount,
        decay_curve=body.decay_curve,
        is_surprise_bag=body.is_surprise_bag,
        value_low=body.value_low,
        value_high=body.value_high,
        status="active",
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _enrich(listing)
