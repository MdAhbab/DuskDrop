# DuskDrop — the hyperlocal "expiring-soon" marketplace

> *"Good food, last call."* A map-and-countdown marketplace where local bakeries, grocers,
> and cafés sell surplus or near-expiry stock at steep, **time-decaying** discounts during
> their final open hours. Buyers reserve, pay, and pick up before the timer hits zero.

**Type:** embeddable **module** (drop-in widget + REST/webhook API + white-label theme) **and**
a standalone demo marketplace.
**Stack:** FastAPI · SQLite (→ Postgres/PostGIS) · React + Vite · Three.js · GSAP · Lenis · MapLibre.

---

## 1. The problem & the wedge

A third of food is wasted while it's still perfectly good — most of it in the last few
hours before a shop closes or a "best before" date lands. The category leader, **Too Good
To Go**, proved the model: **"Surprise Bags" at 50–75% off**, reserve in-app, collect at a
set time, browse on a map. **Olio** does community give-away of food and non-food; **Karma**
lets you pick the *exact* discounted item instead of a surprise.

**DuskDrop's three wedges:**

1. **Time-decay pricing** — the discount isn't fixed. A listing's price *falls automatically*
   along a curve as expiry/closing approaches, so urgency is real and visible (a live ticking
   price, not a static badge). Vendors clear more stock; buyers who wait gamble against
   sell-out.
2. **It's a module, not just an app** — any existing store, POS, or local-business directory
   can embed DuskDrop listings (widget + API) without building a marketplace.
3. **Impact as a first-class layer** — every reservation tallies *meals saved*, *kg diverted*,
   and *CO₂e avoided*, surfaced to buyers, vendors, and (optionally) a city sustainability
   dashboard. Saving food becomes a visible, gamified habit.

### Benchmark

| Capability | Too Good To Go | Olio | Karma | **DuskDrop** |
|---|---|---|---|---|
| Map + reserve-and-collect | ✅ | partial | ✅ | ✅ |
| Pick exact item (not surprise) | ❌ (bag) | ✅ | ✅ | ✅ + optional surprise bag |
| **Automatic time-decay price** | ❌ (fixed) | n/a | ❌ | ✅ **core** |
| Embeddable into other sites | ❌ | ❌ | ❌ | ✅ **module** |
| Impact tracking surfaced to user | partial | ❌ | ❌ | ✅ **gamified** |
| AI demand/pricing for vendors | ❌ | ❌ | ❌ | ✅ Gemma agents |

---

## 2. Users & core journeys

**Buyer**
1. Open map → see nearby listings with live countdowns and *currently-decaying* prices.
2. Filter ("dinner, under ৳200, ≤1 km, closing within 2h") or ask the **concierge agent** in
   natural language.
3. Reserve → pay → receive a **QR pickup code** and a personal countdown.
4. Collect in-store, scan QR, done. Impact tally updates.

**Vendor (shop)**
1. Snap a photo of surplus → the **listing agent** drafts title, category, allergens, and a
   suggested starting price + decay curve.
2. Set quantity and pickup window; publish.
3. Watch reservations come in; get **demand-forecast** nudges ("list your croissants by 16:30
   to avoid waste").

**Platform / host site (module mode)**
- Embeds the widget or calls the API; receives webhooks on reserve/collect/expire; brands it
  with their own theme tokens.

---

## 3. Feature set

### 3.1 Core (table stakes)
- **Map view** (MapLibre) of live listings, clustered, with distance + walking time.
- **Listing detail**: photos, contents, allergens, original vs current price, **countdown**,
  remaining quantity, pickup window, vendor info.
- **Reserve + pay** (Stripe in prod; mock gateway in dev), **QR pickup code**, order history.
- **Vendor console**: create/manage listings, scan QR to fulfill, daily summary.
- **Search & filters**: category, price, distance, time-to-close, dietary tags.

### 3.2 ✨ New / signature features (the 3–4 that set DuskDrop apart)

1. **Decay-pricing engine** — each listing carries a price curve `price(t)` between
   `list_time` and `expiry`. Curves are selectable (linear, stepped "happy-hour", exponential
   "fire sale") and tuned by the pricing agent. The UI shows the **price physically ticking
   down** and a "next drop in 12:43" indicator. Buyers can set a **"snipe alert"** to auto-notify
   (or auto-reserve) when a listing crosses their target price.

2. **Surprise Surplus Bags** (composes with the **Untold** module) — a vendor can list a
   *mystery* bag ("৳150 bakery bag, value ~৳450"). Contents are assembled by a curation step;
   buyers see category + value range, not exact items. This is the Too-Good-To-Go pattern,
   upgraded with Untold's preference matching when both modules are present.

3. **Impact ledger & "Rescue Streak"** — meals saved, kg diverted, CO₂e avoided, per buyer
   and per vendor, with streaks, neighborhood leaderboards, and shareable cards. Optional
   **city dashboard** aggregates anonymized impact by ward for local governments.

4. **Flock Alerts (geofenced cravings)** — a buyer subscribes to "fresh bread within 800 m
   after 18:00." When a matching listing drops, they get a push with the live price. Vendors
   can see anonymized unmet demand ("23 people near you want pastries tonight").

### 3.3 Module / embeddability features
- **Drop-in widget**: `<script>` + `<div data-duskdrop="map|list|listing">`, themeable via CSS
  variables (light/dark + brand tokens).
- **REST API + webhooks**: listings CRUD, reservations, fulfillment, impact; webhooks for
  `reservation.created`, `order.collected`, `listing.expired`.
- **White-label**: host supplies logo, palette, and copy; DuskDrop renders in their skin.

---

## 4. Data model (SQLite dev → Postgres/PostGIS prod)

```
Vendor(id, name, lat, lng, address, hours_json, logo_url, payout_ref, created_at)
Listing(id, vendor_id, title, description, category, photos_json, allergens_json,
        original_price, currency, qty_total, qty_remaining,
        list_time, expiry_time, pickup_window_start, pickup_window_end,
        decay_curve(enum: linear|stepped|exp), decay_params_json,
        is_surprise_bag(bool), value_low, value_high,
        status(enum: active|sold_out|expired|withdrawn))
PriceSample(id, listing_id, t, computed_price)        # for the live ticking + history
Reservation(id, listing_id, buyer_id, qty, locked_price, qr_code,
            status(enum: held|paid|collected|expired|cancelled), created_at, collected_at)
Buyer(id, name, email, home_lat, home_lng, prefs_json)
ImpactEvent(id, reservation_id, meals_saved, grams_diverted, co2e_grams, ward_code)
FlockAlert(id, buyer_id, category, radius_m, after_time, target_price, auto_reserve(bool))
HostSite(id, name, api_key, theme_tokens_json, webhook_url)        # module mode
```

The decay price is **computed server-side** from `decay_curve` + `decay_params` + clock, and
also derivable client-side for smooth ticking (server is source of truth at reserve time).

---

## 5. API surface (selected)

```
GET    /api/listings?bbox=&category=&max_price=&closing_within=     # map/list query
GET    /api/listings/{id}                                           # detail + current price
GET    /api/listings/{id}/price                                     # current computed price
POST   /api/reservations            { listing_id, qty }             # locks price, returns QR
POST   /api/reservations/{id}/pay
POST   /api/vendor/listings         # create (often pre-filled by listing agent)
POST   /api/vendor/fulfill          { qr_code }                     # scan to collect
GET    /api/impact/me  |  /api/impact/ward/{ward_code}
POST   /api/flock-alerts            { category, radius_m, after_time, target_price }
# Agentic
POST   /api/agents/listing-draft    { photo }      → title/category/allergens/price
GET    /api/agents/forecast/{vendor_id}            → waste-risk + suggested list times
POST   /api/agents/concierge        { query, location } → ranked listings + pickup route
# Module
POST   /api/host/webhooks/test  ·  GET /api/host/widget-config
```

Interactive OpenAPI docs auto-generated at `/docs`.

---

## 6. Agentic layer (Gemma) — summary

Full spec in [`AGENTS.md`](AGENTS.md). Four agents:

1. **Listing Drafter** — photo → structured listing (title, category, allergens, suggested
   price + decay curve).
2. **Demand & Waste Forecaster** — predicts which stock will go unsold; nudges vendors on
   *when* to list and *how steep* a curve.
3. **Pricing Optimizer** — sets/adjusts each listing's decay curve from time-to-expiry,
   remaining qty, foot-traffic, and history.
4. **Buyer Concierge** — natural-language search → ranked listings + an optimized multi-stop
   pickup route before everything closes.

---

## 7. Milestones

- **M0 — Specs & design** (this repo): README, design brief, agent specs.
- **M1 — Core marketplace**: vendors, listings, map, reserve+pay (mock), QR fulfillment.
- **M2 — Decay engine + live ticking UI** + price history.
- **M3 — Impact ledger + Rescue Streak + Flock Alerts.**
- **M4 — Gemma agents** (drafter, forecaster, pricing, concierge).
- **M5 — Module mode**: embeddable widget, host API keys, webhooks, white-label theming.
- **M6 — Surprise Surplus Bags** (compose with Untold), city dashboard.

---

## 8. Run (once implemented)

```bash
# backend
cd backend && uv sync && uvicorn app.main:app --reload      # http://localhost:8000/docs
# frontend
cd frontend && npm install && npm run dev                   # http://localhost:5173
```

See [`DESIGN-INSTRUCTIONS.md`](DESIGN-INSTRUCTIONS.md) for the full front-end design brief and
[`AGENTS.md`](AGENTS.md) for the Gemma agents.

---

### Sources (benchmark)
- Too Good To Go — Surplus Food Marketplace & Surprise Bags: https://www.toogoodtogo.com/en-us/surplus-food-marketplace
- Too Good To Go × Whole Foods grocery surprise bags (CNBC, Nov 2025): https://www.cnbc.com/2025/11/12/too-good-to-go-whole-foods-grocery-surprise-bags.html
- Too Good To Go, Olio & Karma compared (Which?): https://www.which.co.uk/news/article/too-good-to-go-olio-and-karma-food-waste-apps-reviewed-aqujg6k9YcCa
