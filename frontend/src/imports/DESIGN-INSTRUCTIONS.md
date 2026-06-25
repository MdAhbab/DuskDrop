# DuskDrop — Front-End Design Brief (for Claude, in Claude Design)

**You are designing the complete front end of DuskDrop from scratch.** Build **every page**
listed here, for **both desktop and mobile**, in **both light and dark themes**. The result
must feel like a **premium, human-designed product** — not a templated AI site. Use
**React + Vite + Tailwind CSS + Three.js + GSAP (with ScrollTrigger) + Lenis**.

Read this whole brief once, then build in the **step order** at the bottom.

---

## 0. The North Star — what "premium & not AI-made" means here

The emotional core of DuskDrop is **golden hour** — the last warm light of the day, the
quiet urgency of "before it's gone." The whole interface is a **time-of-day instrument**:
as the user scrolls, **light falls**. The sky behind the product literally shifts from warm
gold → amber → ember → deep indigo dusk, driven by scroll progress. This single, committed
idea — *the page is a sunset you scroll through* — is what makes it feel authored, not
assembled.

Avoid every AI-template tell:
- ❌ No center-stacked hero with a gradient blob and three feature cards that fade up.
- ❌ No purple-on-white SaaS gradient. No emoji bullets. No generic "Trusted by" logo strip.
- ✅ Asymmetric, editorial layouts with a strong baseline grid and intentional white space.
- ✅ One bold typographic moment per screen. Real motion tied to scroll, not decoration.
- ✅ Texture: subtle film grain, warm bloom/haze, soft long-shadow "evening" lighting.

---

## 1. Art direction

**Mood words:** golden hour · warm · urgent-but-calm · neighborhood · edible · honest.

**Theme is dual and the sun is the switch.** Dark mode = *late dusk* (the default, hero
feeling). Light mode = *late afternoon / warm paper*. The theme toggle is drawn as a small
**sun/moon on a horizon line** that slides; switching themes re-runs the dusk gradient at a
different point in its arc.

### Color tokens (define as CSS variables; both themes)

**Dark ("Dusk")**
- `--bg`: `#14100E` (near-black warm brown-black)
- `--bg-elev`: `#1E1814`
- `--ink`: `#F6ECE0` (warm off-white)
- `--ink-dim`: `#B9A793`
- `--ember`: `#FF6A3D` (primary accent — the sun)
- `--amber`: `#FFB454` (secondary / price-drop highlight)
- `--gold`: `#F4C95D`
- `--indigo`: `#2B2150` (the cooling far side of dusk)
- `--success`: `#7BC47F` (impact / meals-saved green)

**Light ("Golden afternoon")**
- `--bg`: `#FBF4EA` (warm cream paper)
- `--bg-elev`: `#FFFFFF`
- `--ink`: `#241A12`
- `--ink-dim`: `#6B5A49`
- `--ember`: `#E2502A`
- `--amber`: `#E89B2E`
- `--gold`: `#C99528`
- `--indigo`: `#3A2F63`
- `--success`: `#3E8E51`

Gradients are first-class: a recurring **`--dusk-gradient`** runs gold→amber→ember→indigo and
is reused for the sky, price-drop flashes, and the impact meter fill.

### Typography (choose & load via Google Fonts / Fontsource)
- **Display / headlines:** a characterful contemporary serif with warmth — **Fraunces**
  (use its "Soft" optical axis at large sizes; high contrast, slightly old-style). Headlines
  are big, set tight (`leading-[0.95]`), mixed-case, occasionally italic for the urgent word
  ("*before* it's gone").
- **UI / body:** a clean humanist grotesque — **Mona Sans** or **Inter** — for everything
  functional.
- **Numerals / countdowns / price:** a **tabular monospace** so digits don't jitter while
  ticking — **Space Mono** or **JetBrains Mono**, tabular figures on.
- Type scale (desktop): 12 / 14 / 16 / 18 / 22 / 28 / 40 / 64 / 96. Mobile caps display at ~44.

### Texture & lighting
- A faint **film grain** overlay (SVG/`feTurbulence` or a tiling PNG at ~4% opacity) over the
  whole app — kills the "flat AI gradient" look.
- **Bloom/haze** around the sun and warm light sources (Three.js UnrealBloom, restrained).
- Cards cast **long, warm, low-angle shadows** (as if lit by a setting sun), not neutral grey.

---

## 2. The signature scroll system (read carefully — this is the differentiator)

Set up **Lenis** for smooth inertial scroll and drive **GSAP ScrollTrigger** off Lenis's
scroll value. The user explicitly does **not** want generic "cards fade in." Instead, build
these **specific, scrubbed, scene-based** behaviors:

1. **The descending sun (global background).** A full-viewport Three.js canvas sits behind
   content (`position: fixed`). A **sun disc** with bloom starts high on the landing hero and
   **descends toward a horizon line as global scroll progresses**, while the sky color
   interpolates along `--dusk-gradient`. By the footer, the sun has set and stars plus the
   first warm shop windows glow. Scroll *is* the passage of an evening. (Reduce to a static gradient if
   `prefers-reduced-motion`.)

2. **Price that falls as you scroll (hero demo).** In the hero, a single demo listing's
   **price counts down in sync with scroll** — scroll down and the number drops along its
   decay curve, an amber trail draws the curve behind it, and a "−42%" badge fills. This
   *shows* the core mechanic through motion, not copy.

3. **Pinned countdown reveal.** One section **pins** (ScrollTrigger pin) while a circular
   countdown ring **drains** and the surrounding copy crossfades through three states
   ("listed → reserved → collected"). The pin makes the moment feel deliberate and premium.

4. **Parallax depth in the neighborhood scene.** A stylized street-of-shops illustration moves
   in **3–4 parallax layers** (far rooftops slowest, foreground awning fastest); warm windows
   light up one by one as you scroll past closing time.

5. **Horizontal "last hour" timeline.** A section that scrolls **horizontally** (vertical
   scroll → x-translate via ScrollTrigger) showing a shop's final hour: 17:00 full price →
   18:30 −30% → 19:30 −60% → 20:00 "rescued," with the sky darkening across the strip.

6. **Magnetic / inertial micro-motion.** Buttons and the map pin have subtle magnetic hover;
   numbers use GSAP counters; transitions use warm easing (`expo.out`, custom dusk ease).

> Motion rules: everything important is **scrubbed to scroll** (deterministic), not
> time-based autoplay. Honor `prefers-reduced-motion` (swap scrubbed scenes for instant
> states + the static gradient). Keep the 3D canvas at one shared instance; lazy-init heavy
> scenes per route.

---

## 3. Pages to design (every one, desktop + mobile, light + dark)

For each page: state the **layout grid**, the **hero/lead moment**, the **scroll behavior**,
and the **mobile adaptation**.

### 3.1 Landing / Marketing home
- **Hero:** asymmetric. Left: a huge Fraunces headline — *"Good food, last call."* with the
  urgent word italic; a live demo price ticking under it. Right/behind: the Three.js dusk sky
  + descending sun. A single ember CTA "Find food near you."
- **Sections (in scroll order):** (a) the price-falls-as-you-scroll demo; (b) horizontal
  "last hour" timeline; (c) parallax neighborhood street that lights up; (d) impact section —
  a big counter ("**412,000 meals rescued**") that ticks up on enter, with the dusk gradient
  filling a meter; (e) "How it works" as a pinned 3-step countdown reveal; (f) for-vendors
  band; (g) footer where the sun has fully set (stars, warm shop windows).
- **Mobile:** hero stacks; sun moves to a top band; horizontal timeline becomes a snap-scroll
  carousel; keep the descending-sun gradient as the scroll spine.

### 3.2 Map / Discover (the core utility screen)
- Full-bleed **MapLibre** map with a warm/dusk map style (custom tiles, muted at night).
  Custom **ember pin markers** that pulse softer as their countdown shrinks. Listings cluster.
- A **bottom sheet** (mobile) / **left rail** (desktop) of listing cards: photo, vendor,
  **current price ticking**, original price struck through, countdown, distance/walk time,
  "next drop in mm:ss."
- Filter bar: category chips, price slider, "closing within," dietary tags. A prominent
  **"Ask DuskDrop" concierge** field (natural language).
- Selecting a pin flies the camera and raises the listing detail. Subtle parallax on the map
  as the sheet drags. **Mobile-first**: thumb-reachable sheet, large tap targets.

### 3.3 Listing detail
- Big photo carousel with warm bloom edge. **Price block is the star:** large tabular price
  *currently decaying live*, a small sparkline of its decay curve, "−X%", remaining qty,
  pickup window, and a circular **countdown ring**.
- Allergen/contents chips, vendor card with map snippet + walk time.
- Sticky **Reserve** bar (ember) showing the price the user locks *right now*; a "set snipe
  alert" link. On reserve → QR + personal countdown screen.

### 3.4 Reservation / QR pickup
- Calm, focused: large **QR code**, the locked price, pickup window, live countdown, vendor
  address with "directions." Impact preview ("you're about to save ~1.2 kg / 3 meals").
- Post-collection: confetti-free, tasteful **"rescued"** state; impact added to streak.

### 3.5 Surprise Surplus Bag
- Mystery treatment: contents hidden behind a wrapped/paper-bag visual; show **category +
  value range** ("~৳450 value for ৳150"), not items. A teasing micro-reveal on hover/scroll.
  (Visually rhymes with the Untold module without copying it.)

### 3.6 Impact / Rescue Streak (buyer profile)
- Editorial dashboard: meals saved, kg diverted, CO₂e avoided as **big animated numerals**;
  a **streak ribbon**; neighborhood leaderboard; shareable card generator (renders a
  dusk-gradient image). The dusk gradient = the "fill" of progress bars.

### 3.7 Flock Alerts
- Create-alert form drawn as setting a **geofence on a mini map** (radius ring), a time ("after
  18:00"), and a target price. List of active alerts with on/off toggles.

### 3.8 Vendor console
- Different, more **utilitarian** skin (still warm). Dashboard: today's listings, reservations,
  waste-risk nudges from the forecaster agent. **Create-listing flow** with the photo →
  agent-drafted fields (editable) and a **decay-curve picker** (linear/stepped/exp) shown as
  a draggable graph. **Scan-to-fulfill** QR screen.

### 3.9 Module / embed showcase
- A page documenting the embeddable widget: live theme-token playground (drag sliders → the
  widget reskins live), copyable `<script>` snippet, API/webhook docs styled to match.

### 3.10 System / states
- Empty states (no listings nearby → "the sun's still up, check back near closing"), loading
  (a sun-loader), errors, auth (magic-link), 404 (a set sun).

---

## 4. Components library (build these as reusable, themed)
- `DuskCanvas` (the shared Three.js sky + descending sun, scroll-driven).
- `TickingPrice` (GSAP counter, tabular mono, decay-curve sparkline).
- `CountdownRing` / `CountdownDigits`.
- `ListingCard`, `ListingSheet`, `MapPin` (countdown-aware).
- `ImpactCounter`, `StreakRibbon`.
- `DecayCurvePicker` (vendor).
- `ThemeToggle` (sun/moon-on-horizon).
- `GrainOverlay`, `Bloom`, `MagneticButton`.

Tailwind: drive all color via CSS variables so light/dark/white-label swap is one token set.
Define a `dusk` theme extension (colors, the `--dusk-gradient`, warm shadows, custom eases).

---

## 5. Responsive & mobile (first-class, not an afterthought)
- Design **mobile layouts explicitly** for every page above. Map/Discover is **mobile-first**
  (most buyers are walking). Bottom sheets, thumb zones, 44px+ targets, safe-area insets.
- Heavy Three.js scenes degrade to lighter shaders / static dusk gradient on low-power devices;
  detect with a quick perf probe and `prefers-reduced-motion`.
- Horizontal/pinned scroll sections must have **touch-friendly** equivalents (snap carousels).

---

## 6. Accessibility & performance
- WCAG AA contrast in **both** themes (watch ember-on-cream). Visible focus rings (gold).
- All motion respects `prefers-reduced-motion`. Countdowns announced politely to screen
  readers; never rely on color alone for "price dropped."
- Lazy-load 3D and map; code-split routes; target LCP < 2.5s on mid mobile; one Three.js
  context; pause canvas when offscreen/tab hidden.

---

## 7. Build order (do the steps in sequence)
1. **Design tokens & theming**: Tailwind config, CSS variables for both themes, type scale,
   grain + shadow utilities, the `--dusk-gradient`. Ship the `ThemeToggle`.
2. **Motion foundation**: install Lenis, wire GSAP ScrollTrigger to Lenis, build `DuskCanvas`
   (descending sun + sky interpolation) as the fixed global background.
3. **Landing page** top-to-bottom with all six scroll scenes (price-falls demo, horizontal
   last-hour timeline, parallax street, impact counter, pinned how-it-works, dusk footer).
4. **Core components**: `TickingPrice`, `CountdownRing`, `ListingCard`.
5. **Map / Discover** (mobile-first) + filters + concierge field.
6. **Listing detail** → **Reservation/QR** flow.
7. **Impact / Streak**, **Flock Alerts**, **Surprise Bag** page.
8. **Vendor console** (create-listing + decay-curve picker + scan-to-fulfill).
9. **Module/embed showcase** with the live theme-token playground.
10. **States** (empty/loading/error/auth/404), accessibility & reduced-motion pass, perf pass.

Deliver each page in **both themes** and **both breakpoints**, with the scroll behaviors wired
(not just static mockups). Annotate each ScrollTrigger so engineers can reproduce timings.
