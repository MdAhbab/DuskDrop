import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Store } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { to: "/discover", label: "Discover" },
  { to: "/impact", label: "Impact" },
  { to: "/alerts", label: "Flock Alerts" },
  { to: "/surprise", label: "Surprise Bags" },
  { to: "/module", label: "For sites" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onVendor = pathname.startsWith("/vendor");

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="DuskDrop home">
          <span className="relative grid size-9 place-items-center rounded-full dusk-gradient shadow-ember">
            <span className="size-4 rounded-full bg-[var(--bg)]/85" />
          </span>
          <span className="font-display text-[1.3rem] font-semibold tracking-tight text-[var(--ink)]">
            Dusk<span className="text-[var(--ember)]">Drop</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-elev)]/70 px-1.5 py-1.5 backdrop-blur-md md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-sm ease-dusk transition-colors ${
                  isActive ? "bg-[var(--accent)] text-[var(--ink)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/vendor"
            className={`hidden items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm ease-dusk transition-colors sm:inline-flex ${
              onVendor ? "border-[var(--ember)] text-[var(--ember)]" : "border-[var(--border)] text-[var(--ink-dim)] hover:text-[var(--ink)]"
            }`}
          >
            <Store className="size-4" /> Vendor
          </Link>
          <ThemeToggle />
          <button
            className="grid size-9 place-items-center rounded-full border border-[var(--border)] text-[var(--ink)] md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-2 grid gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-2 shadow-dusk md:hidden"
          >
            {[...LINKS, { to: "/vendor", label: "Vendor console" }].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 ease-dusk transition-colors ${
                    isActive ? "bg-[var(--accent)] text-[var(--ink)]" : "text-[var(--ink-dim)]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
