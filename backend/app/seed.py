"""
Seed the SQLite database with the demo data from the frontend's data.ts.
Called once at startup if the DB is empty.
"""
import json
from datetime import datetime, timedelta, timezone
from .database import SessionLocal
from .models import Vendor, Listing, Buyer, FlockAlert


def _now():
    return datetime.now(timezone.utc)


def seed_db():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Vendor).count() > 0:
            return

        # ── Demo buyer ──────────────────────────────────────────────────────
        buyer = Buyer(
            id="b1",
            name="You",
            email="you@duskdrop.demo",
            home_lat=23.7561,
            home_lng=90.3742,
            streak_days=12,
            best_streak=21,
        )
        db.add(buyer)

        # ── Vendors (from frontend data.ts) ─────────────────────────────────
        vendors_data = [
            {"id": "v1", "name": "Aurelio's Bakehouse", "kind": "Artisan bakery",
             "address": "14 Lantern Lane, Dhanmondi", "rating": 4.8, "lat": 32, "lng": 28, "logo": "🥐"},
            {"id": "v2", "name": "The Daily Crumb", "kind": "Patisserie & café",
             "address": "Block C, Gulshan Ave", "rating": 4.6, "lat": 58, "lng": 41, "logo": "🧁"},
            {"id": "v3", "name": "Greengrocer & Co.", "kind": "Neighbourhood grocer",
             "address": "27 Market Row, Banani", "rating": 4.5, "lat": 44, "lng": 64, "logo": "🥬"},
            {"id": "v4", "name": "Saffron Table", "kind": "Home-style kitchen",
             "address": "Lakeview Rd, Uttara", "rating": 4.7, "lat": 70, "lng": 22, "logo": "🍛"},
            {"id": "v5", "name": "Hana Sushi Bar", "kind": "Japanese counter",
             "address": "9 Pier Walk, Bashundhara", "rating": 4.9, "lat": 24, "lng": 72, "logo": "🍣"},
            {"id": "v6", "name": "Ember & Bean", "kind": "Specialty coffee",
             "address": "Corner of 6th & Maple", "rating": 4.4, "lat": 64, "lng": 78, "logo": "☕"},
        ]
        for v in vendors_data:
            db.add(Vendor(**v))

        # ── Image URL helpers ────────────────────────────────────────────────
        IMG = {
            "croissants": "https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "croissantPair": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "breadPlate": "https://images.unsplash.com/photo-1599940778173-e276d4acb2bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "treats": "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "bread2": "https://images.unsplash.com/photo-1613929231151-d7571591259e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "display": "https://images.unsplash.com/photo-1647544301437-36acef1eff9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "display2": "https://images.unsplash.com/photo-1715187985248-84b03aabe629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "pizza": "https://images.unsplash.com/photo-1589010588553-46e8e7c21788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "cooked": "https://images.unsplash.com/photo-1562571708-527276a391ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "buffet": "https://images.unsplash.com/photo-1668838268173-816ee121ad4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "sushi": "https://images.unsplash.com/photo-1553621042-f6e147245754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "sushi2": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "veg": "https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "veg2": "https://images.unsplash.com/photo-1579113800032-c38bd7635818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "coffee": "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "coffee2": "https://images.unsplash.com/photo-1550731358-491ded4af838?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "cake": "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            "cake2": "https://images.unsplash.com/photo-1700448293876-07dca826c161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        }

        # ── Listings (from frontend data.ts) ─────────────────────────────────
        # listedAtMin / closesInMin from mock → convert to real UTC times
        # listed_at = now - listedAtMin; expiry = now + closesInMin
        now = _now()

        listings_data = [
            {
                "id": "l1", "vendor_id": "v1",
                "title": "End-of-day croissant box",
                "description": "A dozen all-butter croissants & pains au chocolat, baked this morning.",
                "category": "Bakery",
                "photos_json": json.dumps([IMG["croissants"], IMG["croissantPair"], IMG["bread2"]]),
                "allergens_json": json.dumps(["Gluten", "Dairy", "Egg"]),
                "dietary_json": json.dumps(["Vegetarian"]),
                "original_price": 540, "max_discount": 0.68, "decay_curve": "exp",
                "qty_total": 9, "qty_remaining": 4,
                "listed_at_min": 95, "closes_in_min": 38,
                "pickup_window_label": "Today · 19:30 – 20:00",
                "distance_m": 320, "walk_min": 4,
            },
            {
                "id": "l2", "vendor_id": "v2",
                "title": "Patisserie surprise bag",
                "description": "A mystery mix of the day's unsold cakes, tarts & macarons.",
                "category": "Dessert",
                "photos_json": json.dumps([IMG["display"], IMG["display2"], IMG["treats"]]),
                "allergens_json": json.dumps(["Gluten", "Dairy", "Egg", "Nuts"]),
                "dietary_json": json.dumps(["Vegetarian"]),
                "original_price": 450, "max_discount": 0.66, "decay_curve": "stepped",
                "qty_total": 12, "qty_remaining": 7,
                "listed_at_min": 60, "closes_in_min": 72,
                "pickup_window_label": "Today · 20:00 – 21:00",
                "is_surprise_bag": True, "value_low": 420, "value_high": 560,
                "distance_m": 850, "walk_min": 11,
            },
            {
                "id": "l3", "vendor_id": "v5",
                "title": "Chef's nigiri selection (12 pc)",
                "description": "Today's cut fish over seasoned rice — must go before close.",
                "category": "Sushi",
                "photos_json": json.dumps([IMG["sushi"], IMG["sushi2"]]),
                "allergens_json": json.dumps(["Fish", "Soy", "Sesame"]),
                "dietary_json": json.dumps(["Pescatarian", "Gluten-free"]),
                "original_price": 920, "max_discount": 0.55, "decay_curve": "linear",
                "qty_total": 6, "qty_remaining": 2,
                "listed_at_min": 40, "closes_in_min": 26,
                "pickup_window_label": "Today · 21:00 – 21:45",
                "distance_m": 1200, "walk_min": 15,
            },
            {
                "id": "l4", "vendor_id": "v4",
                "title": "Home-style dinner for two",
                "description": "Biryani, dal, salad & two breads — a full evening meal.",
                "category": "Restaurant",
                "photos_json": json.dumps([IMG["cooked"], IMG["buffet"], IMG["pizza"]]),
                "allergens_json": json.dumps(["Gluten", "Dairy"]),
                "dietary_json": json.dumps(["Halal"]),
                "original_price": 680, "max_discount": 0.6, "decay_curve": "exp",
                "qty_total": 8, "qty_remaining": 5,
                "listed_at_min": 30, "closes_in_min": 95,
                "pickup_window_label": "Today · 21:30 – 22:15",
                "distance_m": 1900, "walk_min": 22,
            },
            {
                "id": "l5", "vendor_id": "v3",
                "title": "Ugly-but-good veg box",
                "description": "Perfectly good seasonal produce, just past its prettiest.",
                "category": "Grocery",
                "photos_json": json.dumps([IMG["veg"], IMG["veg2"]]),
                "allergens_json": json.dumps([]),
                "dietary_json": json.dumps(["Vegan", "Gluten-free"]),
                "original_price": 380, "max_discount": 0.7, "decay_curve": "stepped",
                "qty_total": 15, "qty_remaining": 9,
                "listed_at_min": 120, "closes_in_min": 130,
                "pickup_window_label": "Today · 19:00 – 20:30",
                "distance_m": 640, "walk_min": 8,
            },
            {
                "id": "l6", "vendor_id": "v6",
                "title": "Two-for-one filter coffee + pastry",
                "description": "Last brew of the day with a warm cinnamon swirl.",
                "category": "Cafe",
                "photos_json": json.dumps([IMG["coffee"], IMG["coffee2"], IMG["treats"]]),
                "allergens_json": json.dumps(["Dairy", "Gluten"]),
                "dietary_json": json.dumps(["Vegetarian"]),
                "original_price": 260, "max_discount": 0.5, "decay_curve": "linear",
                "qty_total": 20, "qty_remaining": 12,
                "listed_at_min": 25, "closes_in_min": 50,
                "pickup_window_label": "Today · 18:30 – 19:15",
                "distance_m": 410, "walk_min": 5,
            },
            {
                "id": "l7", "vendor_id": "v1",
                "title": "Sourdough & seeded loaves",
                "description": "Yesterday's bake — exceptional toasted, two loaves.",
                "category": "Bakery",
                "photos_json": json.dumps([IMG["breadPlate"], IMG["bread2"]]),
                "allergens_json": json.dumps(["Gluten"]),
                "dietary_json": json.dumps(["Vegan"]),
                "original_price": 300, "max_discount": 0.6, "decay_curve": "exp",
                "qty_total": 10, "qty_remaining": 6,
                "listed_at_min": 70, "closes_in_min": 64,
                "pickup_window_label": "Today · 19:30 – 20:30",
                "distance_m": 320, "walk_min": 4,
            },
            {
                "id": "l8", "vendor_id": "v2",
                "title": "Chocolate fudge slice (x2)",
                "description": "Rich, dense, two generous slices boxed to go.",
                "category": "Dessert",
                "photos_json": json.dumps([IMG["cake"], IMG["cake2"]]),
                "allergens_json": json.dumps(["Gluten", "Dairy", "Egg"]),
                "dietary_json": json.dumps(["Vegetarian"]),
                "original_price": 320, "max_discount": 0.62, "decay_curve": "stepped",
                "qty_total": 8, "qty_remaining": 3,
                "listed_at_min": 50, "closes_in_min": 44,
                "pickup_window_label": "Today · 20:00 – 21:00",
                "distance_m": 850, "walk_min": 11,
            },
        ]

        for data in listings_data:
            listed_at_min = data.pop("listed_at_min")
            closes_in_min = data.pop("closes_in_min")
            listing = Listing(
                list_time=now - timedelta(minutes=listed_at_min),
                expiry_time=now + timedelta(minutes=closes_in_min),
                **data,
            )
            db.add(listing)

        # ── Flock Alerts (seed) ──────────────────────────────────────────────
        alerts = [
            FlockAlert(id="a1", buyer_id="b1", category="Bakery", radius_m=800,
                       after_time="18:00", target_price=200, auto_reserve=False, active=True),
            FlockAlert(id="a2", buyer_id="b1", category="Sushi", radius_m=1500,
                       after_time="20:30", target_price=450, auto_reserve=True, active=True),
            FlockAlert(id="a3", buyer_id="b1", category="Dessert", radius_m=600,
                       after_time="19:00", target_price=180, auto_reserve=False, active=False),
        ]
        for a in alerts:
            db.add(a)

        db.commit()
        print("[OK] Database seeded with DuskDrop demo data.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed error: {e}")
        raise
    finally:
        db.close()
