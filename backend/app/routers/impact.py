"""Impact router — GET /api/impact/me, /api/impact/ward/{ward_code}"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import ImpactEvent, Buyer, Reservation
from ..schemas import ImpactOut, WardImpactOut, WeeklyPoint, LeaderboardEntry

router = APIRouter(prefix="/api/impact", tags=["impact"])

GLOBAL_SEED = 412000  # meals rescued globally (static seed + real data)


@router.get("/me", response_model=ImpactOut)
def get_my_impact(buyer_id: str = "b1", db: Session = Depends(get_db)):
    """Returns the demo buyer's personal impact stats."""
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()

    # Aggregate impact events for this buyer
    events = db.query(ImpactEvent).filter(ImpactEvent.buyer_id == buyer_id).all()
    my_meals = sum(e.meals_saved for e in events) + 47   # +47 seed offset
    my_grams = sum(e.grams_diverted for e in events) + 18400
    my_co2e = sum(e.co2e_grams for e in events) + 39200

    weekly = [
        WeeklyPoint(day="Mon", meals=4),
        WeeklyPoint(day="Tue", meals=2),
        WeeklyPoint(day="Wed", meals=6),
        WeeklyPoint(day="Thu", meals=3),
        WeeklyPoint(day="Fri", meals=8),
        WeeklyPoint(day="Sat", meals=5),
        WeeklyPoint(day="Sun", meals=7),
    ]

    leaderboard = [
        LeaderboardEntry(name="Nadia R.", meals=64, you=False),
        LeaderboardEntry(name="Imran K.", meals=58, you=False),
        LeaderboardEntry(name="You", meals=round(my_meals, 1), you=True),
        LeaderboardEntry(name="Tania H.", meals=41, you=False),
        LeaderboardEntry(name="Rafi A.", meals=38, you=False),
    ]

    return ImpactOut(
        meals_rescued_global=GLOBAL_SEED + len(events) * 3,
        my_meals=round(my_meals, 1),
        my_kg=round(my_grams / 1000, 1),
        my_co2e_kg=round(my_co2e / 1000, 1),
        streak_days=buyer.streak_days if buyer else 12,
        best_streak=buyer.best_streak if buyer else 21,
        rank_ward=3,
        ward_name="Dhanmondi",
        weekly=weekly,
        leaderboard=leaderboard,
    )


@router.get("/ward/{ward_code}", response_model=WardImpactOut)
def get_ward_impact(ward_code: str, db: Session = Depends(get_db)):
    events = db.query(ImpactEvent).filter(ImpactEvent.ward_code == ward_code).all()
    return WardImpactOut(
        ward_code=ward_code,
        total_meals=sum(e.meals_saved for e in events),
        total_kg=sum(e.grams_diverted for e in events) / 1000,
        total_co2e_kg=sum(e.co2e_grams for e in events) / 1000,
    )
