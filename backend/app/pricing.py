"""
Server-side decay pricing engine — mirrors frontend lib/data.ts logic.
The server is the source of truth at reservation-lock time.
"""
from datetime import datetime, timezone
from math import floor


def _now_ms() -> float:
    return datetime.now(timezone.utc).timestamp() * 1000


def listing_progress(list_time: datetime, expiry_time: datetime, now: datetime | None = None) -> float:
    """
    Returns 0.0 (just listed) → 1.0 (expired).
    """
    if now is None:
        now = datetime.now(timezone.utc)
    # Ensure timezone-aware comparison
    if list_time.tzinfo is None:
        list_time = list_time.replace(tzinfo=timezone.utc)
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(tzinfo=timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    total = (expiry_time - list_time).total_seconds()
    if total <= 0:
        return 1.0
    elapsed = (now - list_time).total_seconds()
    return max(0.0, min(1.0, elapsed / total))


def curve_factor(curve: str, p: float) -> float:
    if curve == "linear":
        return p
    elif curve == "exp":
        return p ** 2.1       # slow start, late fire-sale plunge
    elif curve == "stepped":
        steps = 5
        return floor(p * steps) / steps
    return p


def current_price(
    original_price: int,
    max_discount: float,
    decay_curve: str,
    list_time: datetime,
    expiry_time: datetime,
    now: datetime | None = None,
) -> int:
    """Returns the integer current price (BDT rupees)."""
    p = listing_progress(list_time, expiry_time, now)
    price = original_price * (1 - max_discount * curve_factor(decay_curve, p))
    return max(1, round(price))


def discount_pct(
    original_price: int,
    max_discount: float,
    decay_curve: str,
    list_time: datetime,
    expiry_time: datetime,
    now: datetime | None = None,
) -> int:
    price = current_price(original_price, max_discount, decay_curve, list_time, expiry_time, now)
    return round((1 - price / original_price) * 100)


def ms_until_close(expiry_time: datetime, now: datetime | None = None) -> int:
    if now is None:
        now = datetime.now(timezone.utc)
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(tzinfo=timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    return max(0, int((expiry_time - now).total_seconds() * 1000))


def decay_series(
    original_price: int,
    max_discount: float,
    decay_curve: str,
    list_time: datetime,
    expiry_time: datetime,
    points: int = 40,
) -> list[dict]:
    """Whole-price samples across the listing's life, for sparklines."""
    start_ts = list_time.timestamp()
    end_ts = expiry_time.timestamp()
    result = []
    for i in range(points):
        frac = i / (points - 1)
        t_ts = start_ts + (end_ts - start_ts) * frac
        t_dt = datetime.fromtimestamp(t_ts, tz=timezone.utc)
        price = current_price(original_price, max_discount, decay_curve, list_time, expiry_time, t_dt)
        result.append({"t": int(t_ts * 1000), "price": price})
    return result
