"""Reservations router — POST /api/reservations, collect, pay"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Listing, Reservation, ImpactEvent, Buyer
from ..schemas import ReservationCreate, ReservationOut
from ..pricing import current_price as compute_price

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


def _qr(listing_id: str, locked: int, res_id: str) -> str:
    """Generate a deterministic QR code string."""
    slug = res_id.split("-")[0].upper()
    return f"DD-{listing_id.upper()}-{slug}"


@router.post("", response_model=ReservationOut, status_code=201)
def create_reservation(body: ReservationCreate, db: Session = Depends(get_db)):
    """Reserve a listing — locks the current price."""
    listing = db.query(Listing).filter(
        Listing.id == body.listing_id, Listing.status == "active"
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or no longer active")

    if listing.qty_remaining < body.qty:
        raise HTTPException(status_code=409, detail="Not enough quantity remaining")

    # Ensure buyer exists (demo buyer auto-created if needed)
    buyer = db.query(Buyer).filter(Buyer.id == body.buyer_id).first()
    if not buyer:
        buyer = Buyer(id=body.buyer_id, name="Demo Buyer")
        db.add(buyer)

    now = datetime.now(timezone.utc)
    locked = compute_price(
        listing.original_price, listing.max_discount, listing.decay_curve,
        listing.list_time, listing.expiry_time, now,
    ) * body.qty

    res_id = str(uuid.uuid4())
    qr = _qr(listing.id, locked, res_id)

    reservation = Reservation(
        id=res_id,
        listing_id=listing.id,
        buyer_id=body.buyer_id,
        qty=body.qty,
        locked_price=locked,
        qr_code=qr,
        status="held",
    )
    db.add(reservation)

    # Deduct qty
    listing.qty_remaining -= body.qty
    if listing.qty_remaining == 0:
        listing.status = "sold_out"

    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: str, db: Session = Depends(get_db)):
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return r


@router.post("/{reservation_id}/pay", response_model=ReservationOut)
def pay_reservation(reservation_id: str, db: Session = Depends(get_db)):
    """Mock payment endpoint — transitions held → paid."""
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status != "held":
        raise HTTPException(status_code=409, detail=f"Cannot pay: status is '{r.status}'")
    r.status = "paid"
    db.commit()
    db.refresh(r)
    return r


@router.post("/{reservation_id}/collect", response_model=ReservationOut)
def collect_reservation(reservation_id: str, db: Session = Depends(get_db)):
    """Vendor scans QR → collected. Records impact event."""
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status not in ("held", "paid"):
        raise HTTPException(status_code=409, detail=f"Cannot collect: status is '{r.status}'")

    now = datetime.now(timezone.utc)
    r.status = "collected"
    r.collected_at = now

    # Record impact (simple estimate: 0.4 kg / meal, 3 meals per unit)
    meals = r.qty * 3.0
    grams = r.qty * 400.0
    impact = ImpactEvent(
        reservation_id=r.id,
        buyer_id=r.buyer_id,
        meals_saved=meals,
        grams_diverted=grams,
        co2e_grams=grams * 2.5,
        ward_code="dhk-01",
    )
    db.add(impact)

    # Update buyer streak
    buyer = db.query(Buyer).filter(Buyer.id == r.buyer_id).first()
    if buyer:
        buyer.streak_days += 1
        buyer.best_streak = max(buyer.best_streak, buyer.streak_days)

    db.commit()
    db.refresh(r)
    return r


@router.post("/qr/{qr_code}/collect", response_model=ReservationOut)
def collect_by_qr(qr_code: str, db: Session = Depends(get_db)):
    """Vendor scans QR code string to collect."""
    r = db.query(Reservation).filter(Reservation.qr_code == qr_code).first()
    if not r:
        raise HTTPException(status_code=404, detail="QR code not found")
    return collect_reservation(r.id, db)
