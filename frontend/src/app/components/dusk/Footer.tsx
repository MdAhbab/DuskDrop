import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-[var(--border)]">
      {/* the sun has fully set here — deep indigo night with a warm horizon */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[var(--indigo)]/30 to-black/40" />
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full dusk-gradient">
                <span className="size-4 rounded-full bg-[var(--bg)]/85" />
              </span>
              <span className="font-display text-xl font-semibold text-[var(--ink)]">
                Dusk<span className="text-[var(--ember)]">Drop</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-[var(--ink-dim)]">
              Good food, last call. A map-and-countdown marketplace for surplus food — sold at
              steeply, honestly decaying prices in the final open hours.
            </p>
          </div>
          {[
            { h: "Eat", links: [["Discover", "/discover"], ["Surprise bags", "/surprise"], ["Flock alerts", "/alerts"], ["Your impact", "/impact"]] },
            { h: "Sell", links: [["Vendor console", "/vendor"], ["List surplus", "/vendor"], ["For sites", "/module"]] },
            { h: "Company", links: [["About", "/"], ["Sources", "/"], ["Privacy", "/"]] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="text-sm uppercase tracking-wider text-[var(--ink-dim)]">{col.h}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-[var(--ink)] ease-dusk transition-colors hover:text-[var(--amber)]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--ink-dim)] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} DuskDrop · A third of food is wasted while it's still good. Let's catch the last call.</span>
          <span className="tnum">412,000 meals rescued and counting</span>
        </div>
      </div>
    </footer>
  );
}
