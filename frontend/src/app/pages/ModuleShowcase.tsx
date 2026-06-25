import { useState } from "react";
import { Copy, Check, Code2, Webhook, KeyRound, Boxes } from "lucide-react";
import { CURRENCY } from "../lib/data";
import { Eyebrow } from "../components/dusk/Reveal";
import { Footer } from "../components/dusk/Footer";
import { toast } from "sonner";

export default function ModuleShowcase() {
  const [accent, setAccent] = useState("#ff6a3d");
  const [bg, setBg] = useState("#1e1814");
  const [ink, setInk] = useState("#f6ece0");
  const [radius, setRadius] = useState(18);
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://cdn.duskdrop.app/widget.js" async></script>
<div data-duskdrop="map"
  data-near="dhanmondi"
  data-accent="${accent}"
  data-radius="${radius}px"
  data-theme="dusk"></div>`;

  function copy() {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    toast.success("Snippet copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Eyebrow>DuskDrop is a module, not just an app</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1] text-[var(--ink)]">
          Drop the last call <span className="italic text-dusk-gradient">into any site.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[var(--ink-dim)]">
          Any store, POS or local directory can embed live DuskDrop listings — widget + REST API + webhooks,
          white-labelled to your brand tokens.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* token playground */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
            <div className="flex items-center gap-2"><Boxes className="size-5 text-[var(--amber)]" /><div className="font-display text-xl text-[var(--ink)]">Theme-token playground</div></div>
            <div className="mt-5 space-y-4">
              <ColorRow label="Accent" value={accent} onChange={setAccent} />
              <ColorRow label="Surface" value={bg} onChange={setBg} />
              <ColorRow label="Text" value={ink} onChange={setInk} />
              <div>
                <div className="flex justify-between text-sm"><span className="text-[var(--ink-dim)]">Corner radius</span><span className="tnum text-[var(--ink)]">{radius}px</span></div>
                <input type="range" min={0} max={32} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-2 w-full accent-[var(--ember)]" />
              </div>
            </div>
          </div>

          {/* live widget preview — reskins as tokens change */}
          <div className="grid place-items-center rounded-3xl border border-[var(--border)] bg-[repeating-linear-gradient(45deg,var(--bg)_0_12px,var(--bg-elev)_12px_24px)] p-8">
            <div
              className="w-full max-w-sm overflow-hidden border border-black/10 shadow-dusk transition-all"
              style={{ background: bg, color: ink, borderRadius: radius }}
            >
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="" className="aspect-[16/9] w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs text-white" style={{ background: accent }}>−42%</span>
              </div>
              <div className="p-4">
                <div className="text-xs opacity-60">Aurelio's Bakehouse</div>
                <div className="font-display text-lg">End-of-day croissant box</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="tnum text-2xl font-semibold">{CURRENCY}313</span>
                  <span className="tnum text-sm line-through opacity-50">{CURRENCY}540</span>
                </div>
                <button className="mt-3 w-full py-2.5 text-sm font-medium text-white transition" style={{ background: accent, borderRadius: radius * 0.7 }}>
                  Reserve · closes in 38:00
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-[var(--ink-dim)]">Powered by DuskDrop · white-label preview</div>
          </div>
        </div>

        {/* snippet */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[#0f0c0a] shadow-dusk">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-[#cbb9a3]"><Code2 className="size-4" /> Embed snippet</div>
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 text-sm leading-relaxed text-[#e9dcc8]"><code>{snippet}</code></pre>
        </div>

        {/* API + webhooks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
            <div className="flex items-center gap-2"><KeyRound className="size-5 text-[var(--amber)]" /><div className="font-display text-xl text-[var(--ink)]">REST API</div></div>
            <div className="mt-4 space-y-2 font-mono text-sm">
              {[
                ["GET", "/api/listings?bbox=&category="],
                ["GET", "/api/listings/{id}/price"],
                ["POST", "/api/reservations"],
                ["POST", "/api/vendor/fulfill"],
                ["GET", "/api/impact/ward/{code}"],
              ].map(([m, p]) => (
                <div key={p} className="flex items-center gap-3 rounded-xl bg-[var(--bg)]/40 px-3 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs ${m === "GET" ? "bg-[var(--success)]/20 text-[var(--success)]" : "bg-[var(--ember)]/20 text-[var(--ember)]"}`}>{m}</span>
                  <span className="text-[var(--ink)]">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elev)]/70 p-6 shadow-dusk">
            <div className="flex items-center gap-2"><Webhook className="size-5 text-[var(--amber)]" /><div className="font-display text-xl text-[var(--ink)]">Webhooks</div></div>
            <div className="mt-4 space-y-3">
              {[
                ["reservation.created", "A buyer locked a price."],
                ["order.collected", "QR scanned, pickup done."],
                ["listing.expired", "Window closed — clear it."],
              ].map(([e, d]) => (
                <div key={e} className="rounded-xl bg-[var(--bg)]/40 px-4 py-3">
                  <div className="font-mono text-sm text-[var(--ember)]">{e}</div>
                  <div className="text-sm text-[var(--ink-dim)]">{d}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--ink-dim)]">Interactive OpenAPI docs auto-generated at <span className="font-mono">/docs</span>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--ink-dim)]">{label}</span>
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)]/40 py-1 pl-1 pr-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-7 cursor-pointer rounded-full border-0 bg-transparent" />
        <span className="tnum text-sm text-[var(--ink)]">{value}</span>
      </div>
    </div>
  );
}
