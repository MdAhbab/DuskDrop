import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import {
  Camera,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  QrCode,
  Check,
  LayoutDashboard,
  PlusCircle,
  ScanLine,
  Clock3,
} from "lucide-react";
import { CURRENCY, type DecayCurve } from "../lib/data";
import * as api from "../lib/api";
import { Eyebrow } from "../components/dusk/Reveal";
import { MagneticButton } from "../components/dusk/MagneticButton";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import { toast } from "sonner";

type Tab = "dashboard" | "create" | "fulfill";

export default function Vendor() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [myListings, setMyListings] = useState<api.Listing[]>([]);

  useEffect(() => {
    api.getVendorListings("v1").then((data) => setMyListings(data.slice(0, 4))).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Vendor console · Aurelio's Bakehouse</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-[var(--ink)]">Clear the shelves.</h1>
        </div>
        <div className="flex w-full gap-1 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--bg-elev)]/70 p-1.5 no-scrollbar backdrop-blur sm:w-auto">
          {([
            ["dashboard", "Dashboard", <LayoutDashboard className="size-4" key="1" />],
            ["create", "Snap to list", <PlusCircle className="size-4" key="2" />],
            ["fulfill", "Scan to fulfill", <ScanLine className="size-4" key="3" />],
          ] as const).map(([k, label, icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm ease-dusk transition-colors sm:flex-none ${
                tab === k ? "bg-[var(--ember)] text-white" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {tab === "dashboard" && <Dashboard myListings={myListings} />}
        {tab === "create" && <CreateListing />}
        {tab === "fulfill" && <Fulfill />}
      </div>
    </div>
  );
}

function Dashboard({ myListings }: { myListings: api.Listing[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Today's listings", "9"],
            ["Reservations", "23"],
            ["Revenue saved", `${CURRENCY}6,420`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-5 shadow-dusk">
              <div className="text-xs text-[var(--ink-dim)]">{l}</div>
              <div className="tnum mt-1 font-display text-2xl font-semibold text-[var(--ink)]">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
          <div className="font-display text-xl text-[var(--ink)]">Active listings</div>
          <div className="mt-4 space-y-3">
            {myListings.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 p-3">
                <ImageWithFallback src={l.photos[0] ?? ""} alt="" className="size-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[var(--ink)]">{l.title}</div>
                  <div className="text-xs text-[var(--ink-dim)]">{l.qty_remaining}/{l.qty_total} left · {l.decay_curve} curve</div>
                </div>
                <div className="text-right">
                  <div className="tnum text-[var(--ink)]">{CURRENCY}{l.original_price}</div>
                  <div className="inline-flex items-center gap-1 text-xs text-[var(--ember)]"><TrendingDown className="size-3" /> decaying</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* waste-risk nudges from the forecaster agent */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-[var(--amber)]/30 bg-[var(--amber)]/8 p-6">
          <div className="flex items-center gap-2"><Sparkles className="size-5 text-[var(--amber)]" /><div className="font-display text-xl text-[var(--ink)]">Waste-risk nudges</div></div>
          <div className="mt-1 text-xs text-[var(--ink-dim)]">Demand &amp; Waste Forecaster · updated 14 min ago</div>
          <div className="mt-4 space-y-3">
            {[
              { t: "List croissants by 16:30", d: "~6 likely unsold tonight at the current pace.", c: "82%" },
              { t: "Steepen the sourdough curve", d: "Foot traffic is light — switch to an exponential drop.", c: "74%" },
              { t: "Bundle 2 cakes as a surprise bag", d: "Two slices each, value ৳560 → list at ৳180.", c: "69%" },
            ].map((n) => (
              <div key={n.t} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)]/80 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--amber)]" />
                  <div>
                    <div className="text-[var(--ink)]">{n.t}</div>
                    <div className="mt-0.5 text-sm text-[var(--ink-dim)]">{n.d}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => toast.success("Applied", { description: n.t })} className="rounded-full bg-[var(--ember)] px-3 py-1 text-xs text-white">Apply</button>
                      <button className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--ink-dim)]">Dismiss</button>
                      <span className="ml-auto text-xs text-[var(--ink-dim)]">conf. {n.c}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTED = {
  title: "End-of-day croissant box",
  category: "Bakery",
  allergens: ["Gluten", "Dairy", "Egg"],
  price: 540,
  curve: "exp" as DecayCurve,
};

function CreateListing() {
  const [snapped, setSnapped] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [curve, setCurve] = useState<DecayCurve>("linear");
  const [maxDisc, setMaxDisc] = useState(60);
  const [allergensOk, setAllergensOk] = useState(false);

  function snap() {
    setSnapped(true);
    setTitle(SUGGESTED.title);
    setPrice(SUGGESTED.price);
    setCurve(SUGGESTED.curve);
    setMaxDisc(68);
    toast.success("Listing drafted", { description: "Listing Drafter agent filled the fields — review & confirm." });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* photo → agent draft */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
        <div className="font-display text-xl text-[var(--ink)]">1 · Snap your surplus</div>
        <button
          onClick={snap}
          className="group relative mt-4 grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg)]/40 ease-dusk hover:border-[var(--amber)]"
        >
          {snapped ? (
            <ImageWithFallback src="https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="text-center text-[var(--ink-dim)]">
              <Camera className="mx-auto size-8" />
              <div className="mt-2">Tap to add a photo</div>
            </div>
          )}
        </button>
        {snapped && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--amber)]/12 px-3 py-1 text-sm text-[var(--amber)]">
            <Sparkles className="size-4" /> Vision: croissants · category Bakery · 91% confident
          </motion.div>
        )}
      </div>

      {/* drafted, editable fields */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
        <div className="font-display text-xl text-[var(--ink)]">2 · Review the draft</div>
        <div className="mt-4 space-y-4">
          <Field label="Title" suggested={snapped}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. End-of-day croissant box" className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--amber)]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Original price" suggested={snapped}>
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3">
                <span className="text-[var(--ink-dim)]">{CURRENCY}</span>
                <input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-transparent py-2 text-[var(--ink)] outline-none" />
              </div>
            </Field>
            <Field label="Max discount" suggested={snapped}>
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3">
                <input type="number" value={maxDisc} onChange={(e) => setMaxDisc(Number(e.target.value))} className="w-full bg-transparent py-2 text-[var(--ink)] outline-none" />
                <span className="text-[var(--ink-dim)]">%</span>
              </div>
            </Field>
          </div>

          <Field label="Allergens (you must confirm — safety)" suggested={snapped}>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.allergens.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--ink-dim)]"><AlertTriangle className="size-3" />{a}</span>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-[var(--ink)]">
              <input type="checkbox" checked={allergensOk} onChange={(e) => setAllergensOk(e.target.checked)} className="accent-[var(--ember)]" />
              I confirm these allergens are correct.
            </label>
          </Field>
        </div>
      </div>

      {/* decay curve picker */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="font-display text-xl text-[var(--ink)]">3 · Choose the decay curve</div>
          <div className="text-sm text-[var(--amber)]">Pricing agent recommends: exponential</div>
        </div>
        <DecayCurvePicker curve={curve} setCurve={setCurve} maxDisc={maxDisc} price={price || 540} />
        <div className="mt-6 flex items-center justify-end gap-3">
          <MagneticButton variant="outline">Save as draft</MagneticButton>
          <MagneticButton
            onClick={() =>
              allergensOk
                ? toast.success("Published", { description: "Your listing is live and the price is decaying." })
                : toast.error("Confirm allergens first", { description: "Allergen confirmation is required to publish." })
            }
          >
            Publish listing
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

function Field({ label, suggested, children }: { label: string; suggested?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-sm text-[var(--ink-dim)]">{label}</label>
        {suggested && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--amber)]/12 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--amber)]"><Sparkles className="size-3" />suggested</span>}
      </div>
      {children}
    </div>
  );
}

function DecayCurvePicker({ curve, setCurve, maxDisc, price }: { curve: DecayCurve; setCurve: (c: DecayCurve) => void; maxDisc: number; price: number }) {
  const data = useMemo(() => {
    const f = (c: DecayCurve, p: number) =>
      c === "linear" ? p : c === "exp" ? Math.pow(p, 2.1) : Math.floor(p * 5) / 5;
    return Array.from({ length: 40 }, (_, i) => {
      const p = i / 39;
      return {
        t: i,
        chosen: Math.round(price * (1 - (maxDisc / 100) * f(curve, p))),
        ghost: Math.round(price * (1 - (maxDisc / 100) * Math.pow(p, 2.1))), // agent's recommended exp
      };
    });
  }, [curve, maxDisc, price]);

  return (
    <div>
      <div className="mt-4 flex gap-2">
        {(["linear", "stepped", "exp"] as DecayCurve[]).map((c) => (
          <button
            key={c}
            onClick={() => setCurve(c)}
            className={`flex-1 rounded-2xl border px-4 py-3 text-left ease-dusk transition-colors ${
              curve === c ? "border-[var(--ember)] bg-[var(--ember)]/8" : "border-[var(--border)] hover:border-[var(--amber)]"
            }`}
          >
            <div className="font-display text-[var(--ink)] capitalize">{c}</div>
            <div className="text-xs text-[var(--ink-dim)]">
              {c === "linear" ? "Steady, even drop" : c === "stepped" ? "Happy-hour steps" : "Slow, then fire-sale"}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[0, price]} />
            <Line type="monotone" dataKey="ghost" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            <Line type={curve === "stepped" ? "stepAfter" : "monotone"} dataKey="chosen" stroke="var(--ember)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs text-[var(--ink-dim)]">
        <span>listed · {CURRENCY}{price}</span>
        <span className="text-[var(--amber)]">— — agent's recommended curve (ghost)</span>
        <span>closing · {CURRENCY}{Math.round(price * (1 - maxDisc / 100))}</span>
      </div>
    </div>
  );
}

function Fulfill() {
  const [scanned, setScanned] = useState(false);
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-8 shadow-dusk">
        <div className="font-display text-xl text-[var(--ink)]">Scan to fulfill</div>
        <p className="mt-1 text-sm text-[var(--ink-dim)]">Point at a buyer's QR to reconcile the pickup.</p>
        <div className="relative mx-auto mt-6 grid aspect-square w-56 place-items-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
          {!scanned ? (
            <>
              <QrCode className="size-20 text-[var(--ink-dim)]/50" />
              <motion.div
                className="absolute inset-x-4 h-0.5 bg-[var(--ember)] shadow-ember"
                animate={{ top: ["12%", "88%", "12%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-20 place-items-center rounded-full dusk-gradient">
              <Check className="size-10 text-[var(--bg)]" />
            </motion.div>
          )}
        </div>
        {scanned ? (
          <div className="mt-6">
            <div className="font-display text-xl text-[var(--ink)]">Collected ✓</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--ink-dim)]"><Clock3 className="size-4" /> DD-L1-A4F · {CURRENCY}313 · 1 × croissant box</div>
            <div className="mt-5"><MagneticButton variant="outline" onClick={() => setScanned(false)}>Scan next</MagneticButton></div>
          </div>
        ) : (
          <div className="mt-6"><MagneticButton onClick={() => setScanned(true)}>Simulate scan</MagneticButton></div>
        )}
      </div>
    </div>
  );
}
