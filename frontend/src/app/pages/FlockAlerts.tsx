import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, Plus, Users, Clock3, Crosshair } from "lucide-react";
import { ALL_CATEGORIES, CURRENCY } from "../lib/data";
import { Eyebrow } from "../components/dusk/Reveal";
import { MagneticButton } from "../components/dusk/MagneticButton";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Footer } from "../components/dusk/Footer";
import { toast } from "sonner";
import * as api from "../lib/api";

type CategoryOrAll = (typeof ALL_CATEGORIES)[number] | "Anything";

export default function FlockAlerts() {
  const [alerts, setAlerts] = useState<api.FlockAlert[]>([]);
  const [cat, setCat] = useState<CategoryOrAll>("Bakery");
  const [radius, setRadius] = useState(800);
  const [after, setAfter] = useState("18:00");
  const [target, setTarget] = useState(200);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    api.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  async function create() {
    try {
      const a = await api.createAlert({
        category: cat,
        radius_m: radius,
        after_time: after,
        target_price: target,
        auto_reserve: auto,
      });
      setAlerts((x) => [a, ...x]);
      toast.success("Flock alert created", {
        description: `We'll ping you for ${cat.toLowerCase()} within ${(radius / 1000).toFixed(1)} km after ${after}.`,
      });
    } catch (e: unknown) {
      toast.error("Failed to create alert", { description: String(e) });
    }
  }

  async function toggleAlert(id: string, active: boolean) {
    try {
      const updated = await api.patchAlert(id, { active });
      setAlerts((x) => x.map((a) => (a.id === id ? updated : a)));
    } catch {
      // optimistic fallback
      setAlerts((x) => x.map((a) => (a.id === id ? { ...a, active } : a)));
    }
  }

  // mini-map ring scales from radius (300–2500m → ~30–130px)
  const ringPx = 30 + ((radius - 300) / 2200) * 100;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Eyebrow>Geofenced cravings</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1] text-[var(--ink)]">
          Tell us what you're after. <span className="italic text-[var(--amber)]">We'll catch it.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[var(--ink-dim)]">
          Set a craving, a radius and a target price. When a matching listing drops below your number, you get a ping —
          or it auto-reserves, if you've opted in.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* create form drawn as geofence */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
            <div className="font-display text-xl text-[var(--ink)]">New alert</div>

            {/* mini map with radius ring */}
            <div className="relative mt-4 h-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
              <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(80% 60% at 50% 40%, rgba(255,140,77,0.15), transparent)" }} />
              <svg className="absolute inset-0 size-full">
                <g stroke="var(--ink-dim)" strokeOpacity="0.16" strokeWidth="6" fill="none">
                  <path d="M-20 120 Q 200 80 420 160" />
                  <path d="M180 -20 Q 230 140 200 300" />
                </g>
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="rounded-full border-2 border-[var(--ember)]"
                  animate={{ width: ringPx * 2, height: ringPx * 2 }}
                  style={{ background: "rgba(255,106,61,0.12)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                />
                <span className="absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--ember)] text-white shadow-ember">
                  <Crosshair className="size-4" />
                </span>
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-[var(--bg)]/70 px-2.5 py-1 text-xs text-[var(--ink-dim)] backdrop-blur">
                {(radius / 1000).toFixed(1)} km radius
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm text-[var(--ink-dim)]">Craving</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Anything", ...ALL_CATEGORIES] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full border px-3 py-1.5 text-sm ease-dusk transition-colors ${
                        cat === c ? "border-transparent bg-[var(--ember)] text-white" : "border-[var(--border)] text-[var(--ink-dim)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm"><span className="text-[var(--ink-dim)]">Radius</span><span className="tnum text-[var(--ink)]">{radius} m</span></div>
                <Slider value={[radius]} min={300} max={2500} step={100} onValueChange={([v]) => setRadius(v)} className="mt-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--ink-dim)]">After</label>
                  <input type="time" value={after} onChange={(e) => setAfter(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--amber)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm"><span className="text-[var(--ink-dim)]">Target</span><span className="tnum text-[var(--ink)]">{CURRENCY}{target}</span></div>
                  <Slider value={[target]} min={50} max={600} step={10} onValueChange={([v]) => setTarget(v)} className="mt-3.5" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 p-4">
                <div>
                  <div className="text-[var(--ink)]">Auto-reserve</div>
                  <div className="text-xs text-[var(--ink-dim)]">Spend up to your target automatically (opt-in, bounded).</div>
                </div>
                <Switch checked={auto} onCheckedChange={setAuto} />
              </div>
              <MagneticButton className="w-full" onClick={create}><Plus className="size-4" /> Create alert</MagneticButton>
            </div>
          </div>

          {/* active alerts + unmet demand */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
              <div className="flex items-center gap-2"><Bell className="size-5 text-[var(--amber)]" /><div className="font-display text-xl text-[var(--ink)]">Active alerts</div></div>
              <div className="mt-4 space-y-3">
                {alerts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--ink-dim)]">
                    No alerts yet — create one on the left.
                  </div>
                )}
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 p-4">
                    <div className="flex-1">
                      <div className="text-[var(--ink)]">{a.category} <span className="text-[var(--ink-dim)]">within {(a.radius_m / 1000).toFixed(1)} km</span></div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-dim)]">
                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3" /> after {a.after_time}</span>
                        <span className="tnum">≤ {CURRENCY}{a.target_price}</span>
                        {a.auto_reserve && <span className="rounded-full bg-[var(--ember)]/15 px-2 text-[var(--ember)]">auto-reserve</span>}
                      </div>
                    </div>
                    <Switch
                      checked={a.active}
                      onCheckedChange={(v) => toggleAlert(a.id, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--indigo)]/40 bg-[var(--indigo)]/10 p-6">
              <div className="flex items-center gap-2"><Users className="size-5 text-[var(--ink)]" /><div className="font-display text-xl text-[var(--ink)]">Unmet demand near you</div></div>
              <p className="mt-2 text-sm text-[var(--ink-dim)]">Anonymised signal that vendors see, too:</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
                <li className="flex items-center justify-between"><span>🥖 fresh bread tonight</span><span className="tnum text-[var(--amber)]">23 people</span></li>
                <li className="flex items-center justify-between"><span>🍣 sushi within 1.5 km</span><span className="tnum text-[var(--amber)]">11 people</span></li>
                <li className="flex items-center justify-between"><span>🧁 dessert under ৳200</span><span className="tnum text-[var(--amber)]">17 people</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
