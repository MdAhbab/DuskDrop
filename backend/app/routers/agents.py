"""
Agents router — simulated AI endpoints (mock Gemma agents).
In production these would call the actual Gemma model; here they return
deterministic, realistic responses based on the request data.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ..database import get_db
from ..models import Listing
from ..schemas import (
    ListingDraftOut, ForecastOut, ForecastNudge,
    ConciergeQuery, ConciergeOut
)
from ..routers.listings import _enrich

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.post("/listing-draft", response_model=ListingDraftOut)
async def listing_draft(db: Session = Depends(get_db)):
    """
    Simulated Listing Drafter agent.
    In production: uploads a photo to Gemma vision, returns structured fields.
    Here: returns a deterministic plausible draft.
    """
    return ListingDraftOut(
        title="End-of-day croissant box",
        description="A dozen all-butter croissants & pains au chocolat, baked this morning.",
        category="Bakery",
        allergens=["Gluten", "Dairy", "Egg"],
        suggested_original_price=540,
        suggested_curve="exp",
        suggested_max_discount=0.68,
        confidence=0.91,
    )


@router.get("/forecast/{vendor_id}", response_model=ForecastOut)
def forecast(vendor_id: str, db: Session = Depends(get_db)):
    """
    Simulated Demand & Waste Forecaster.
    Returns waste-risk nudges for the given vendor.
    """
    # In production: run historical analysis + pricing simulation
    nudges = [
        ForecastNudge(
            title="List croissants by 16:30",
            detail="~6 likely unsold tonight at the current pace.",
            confidence="82%",
        ),
        ForecastNudge(
            title="Steepen the sourdough curve",
            detail="Foot traffic is light — switch to an exponential drop.",
            confidence="74%",
        ),
        ForecastNudge(
            title="Bundle 2 cakes as a surprise bag",
            detail="Two slices each, value ৳560 → list at ৳180.",
            confidence="69%",
        ),
    ]
    return ForecastOut(vendor_id=vendor_id, nudges=nudges)


@router.post("/concierge", response_model=ConciergeOut)
def concierge(body: ConciergeQuery, db: Session = Depends(get_db)):
    """
    Simulated Buyer Concierge agent.
    Parses natural-language query and returns ranked listings.
    Simple keyword match; production uses Gemma reasoning.
    """
    query_lower = body.query.lower()
    listings = db.query(Listing).filter(Listing.status == "active").all()

    scored = []
    for listing in listings:
        score = 0
        # Keyword heuristics
        if listing.category.lower() in query_lower:
            score += 3
        for tag in listing.dietary:
            if tag.lower() in query_lower:
                score += 2
        if "surprise" in query_lower and listing.is_surprise_bag:
            score += 5
        if "cheap" in query_lower or "under" in query_lower:
            score += 1 if listing.original_price < 400 else 0
        score += 1  # base relevance

        now = datetime.now(timezone.utc)
        from ..pricing import ms_until_close
        muc = ms_until_close(listing.expiry_time, now)
        if muc > 0:
            scored.append((score, muc, listing))

    scored.sort(key=lambda x: (-x[0], x[1]))
    top_listings = [_enrich(l) for _, _, l in scored[:5]]

    rationale = (
        f"Found {len(top_listings)} listings matching your request. "
        "Sorted by relevance and urgency — grab them before they expire!"
    )
    return ConciergeOut(listings=top_listings, rationale=rationale)
