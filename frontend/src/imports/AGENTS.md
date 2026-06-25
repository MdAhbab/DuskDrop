# DuskDrop — Agentic Layer (Gemma)

DuskDrop ships **four Gemma-powered agents**. Each is a small, tool-using worker with a
narrow job, explicit inputs/outputs, and guardrails. Agents never act with irreversible
financial or customer-facing effect without a confirmation step (vendor approves prices,
buyer approves auto-reserve). Gemma is the reasoning core; **tools** are plain FastAPI
functions it may call.

**Runtime:** each agent = a system prompt + a tool registry + an I/O schema. Dev runs them
via FastAPI `BackgroundTasks`/APScheduler; prod swaps in a Celery worker. All agent runs are
logged (`AgentRun(id, agent, input, tool_calls, output, confidence, created_at)`) for audit
and for the design's "explainability" surfaces.

---

## Shared tool registry

| Tool | Signature | Notes |
|------|-----------|-------|
| `db.query_listings` | `(vendor_id?, bbox?, status?) -> Listing[]` | Read marketplace state. |
| `db.write_listing_draft` | `(fields) -> draft_id` | Writes a **draft** only; never publishes. |
| `vision.describe_food` | `(image) -> {labels, category, allergens, freshness}` | Gemma vision on the vendor photo. |
| `geo.distance_matrix` | `(origin, dests[]) -> {dist_m, walk_s}[]` | Walking distances for routing. |
| `geo.route` | `(origin, stops[]) -> ordered_stops, polyline` | Multi-stop pickup route. |
| `pricing.curve` | `(curve, params, t) -> price` | Evaluates a decay curve. |
| `pricing.simulate` | `(listing, curve, params) -> expected_sellthrough` | Projects sell-out vs waste. |
| `stats.vendor_history` | `(vendor_id) -> {by_hour, by_item, waste_rate}` | Historical demand. |
| `notify.push` | `(buyer_id, payload)` | Flock/snipe notifications (rate-limited). |

Guardrail primitives: every tool call is validated against the agent's allowed set; writes go
to **draft** tables; money/auto-actions require an explicit human-approved flag.

---

## Agent 1 — Listing Drafter
**Job:** turn a vendor's surplus **photo** into a ready-to-edit listing so publishing takes
seconds.

- **Trigger:** vendor taps "snap to list" and uploads a photo.
- **Tools:** `vision.describe_food`, `stats.vendor_history`, `pricing.simulate`,
  `db.write_listing_draft`.
- **Output:** `{ title, description, category, allergens[], suggested_original_price,
  suggested_curve, suggested_params, confidence }` written as a **draft**.
- **Guardrails:** allergen detection is *advisory* — UI forces the vendor to confirm allergens
  (legal/safety). Never auto-publishes. Flags low-confidence vision for manual entry.
- **UI surface:** pre-filled, editable create-listing form; each AI-filled field shows a small
  "suggested" marker the vendor can accept/override.

## Agent 2 — Demand & Waste Forecaster
**Job:** predict which stock is at risk of going unsold and **nudge the vendor on timing**.

- **Trigger:** scheduled hourly per vendor during open hours; also on inventory update.
- **Tools:** `stats.vendor_history`, `db.query_listings`, `pricing.simulate`.
- **Output:** `{ at_risk_items[], suggested_list_time, suggested_curve, expected_waste_kg,
  rationale }`.
- **Guardrails:** suggestions only; no writes. Confidence + plain-language rationale shown so
  vendors trust (and can ignore) it.
- **UI surface:** "Waste-risk" nudges on the vendor dashboard ("List croissants by 16:30 —
  ~6 likely unsold tonight").

## Agent 3 — Pricing Optimizer
**Job:** choose/adjust each active listing's **decay curve** in real time to maximize
sell-through (and revenue) before expiry.

- **Trigger:** on publish, then re-evaluated every N minutes while active.
- **Tools:** `db.query_listings`, `stats.vendor_history`, `geo.distance_matrix` (foot-traffic
  proxy), `pricing.simulate`, `pricing.curve`.
- **Output:** a recommended `{curve, params}` per listing + projected sell-through; optionally
  auto-applied **only if** the vendor enabled "auto-pricing within bounds I set."
- **Guardrails:** hard floor/ceiling set by vendor; auto-apply is opt-in and bounded; every
  change is logged and reversible. Never prices below cost floor.
- **UI surface:** the vendor's `DecayCurvePicker` shows the agent's recommended curve as a
  ghost line the vendor can accept; buyers just see the price tick.

## Agent 4 — Buyer Concierge
**Job:** answer natural-language buyer requests and return ranked listings **+ an optimized
pickup route** before everything closes.

- **Trigger:** buyer uses the "Ask DuskDrop" field (e.g. *"dinner for 2 under ৳300 within
  1 km, gluten-free, closing within 90 min"*).
- **Tools:** `db.query_listings`, `geo.distance_matrix`, `geo.route`, `pricing.curve`,
  `notify.push` (only for snipe/auto-reserve, opt-in).
- **Output:** ranked listings honoring budget/diet/distance/time + a **multi-stop route** with
  per-stop ETAs vs each countdown ("doable: 3 stops, 22 min, all before close").
- **Guardrails:** **auto-reserve** (spending money) requires the buyer's explicit pre-set
  consent and price cap; otherwise the concierge only proposes. Respects dietary/allergen
  filters strictly. Never invents listings — answers only from `db.query_listings`.
- **UI surface:** results render as the normal listing list + a route line on the map; a clear
  "Reserve all" vs per-item reserve.

---

## Cross-cutting guardrails
- **Human-in-the-loop for money & safety:** publishing, auto-pricing, and auto-reserve are all
  opt-in and bounded; allergens always vendor-confirmed.
- **Grounding:** agents answer only from DB/tool results; no fabricated listings or prices.
- **Transparency:** every agent output carries a confidence + short rationale, surfaced in UI.
- **Rate limits & cost:** notifications throttled; agent runs cached where inputs are stable.
- **Auditability:** every run + tool call stored in `AgentRun` for review.
