import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Dark "late dusk" is the default — the hero feeling.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("duskdrop-theme") as Theme) || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("duskdrop-theme", theme);
  }, [theme]);

  const value: ThemeCtx = {
    theme,
    setTheme: setThemeState,
    toggle: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}

/** A shared 1s tick so every countdown across the app advances together. */
import { useRef } from "react";
export function useClock(intervalMs = 1000) {
  const [, force] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    ref.current = window.setInterval(() => force((n) => n + 1), intervalMs);
    return () => window.clearInterval(ref.current);
  }, [intervalMs]);
}
