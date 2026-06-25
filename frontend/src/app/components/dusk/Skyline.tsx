import { useMemo } from "react";

type Roof = "flat" | "tank" | "antenna" | "pitch" | "step";

interface Building {
  id: number;
  w: number;
  h: number;
  roof: Roof;
  cols: number;
  rows: number;
  lit: boolean[];
  delays: number[];
}

interface LayerStyle {
  top: string; // building body top color (darker)
  base: string; // building body base color (warmer, near street)
  window: string;
}

function makeRow(seed: number, count: number, minH: number, maxH: number): Building[] {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const roofs: Roof[] = ["flat", "tank", "antenna", "pitch", "step", "flat", "flat"];
  return Array.from({ length: count }, (_, i) => {
    const w = 42 + Math.round(rnd() * 48);
    const h = minH + Math.round(rnd() * (maxH - minH));
    const cols = Math.max(2, Math.round(w / 15));
    const rows = Math.max(3, Math.round(h / 20));
    const n = cols * rows;
    return {
      id: i,
      w,
      h,
      roof: roofs[Math.floor(rnd() * roofs.length)],
      cols,
      rows,
      lit: Array.from({ length: n }, () => rnd() > 0.4),
      delays: Array.from({ length: n }, () => rnd() * 5),
    };
  });
}

function BuildingShape({ b, ls }: { b: Building; ls: LayerStyle }) {
  return (
    <div className="relative flex flex-col justify-end" style={{ width: b.w, height: b.h }}>
      {/* rooftop ornament */}
      <div className="relative h-3">
        {b.roof === "tank" && <div className="absolute bottom-0 left-1/2 h-3 w-4 -translate-x-1/2 rounded-t-sm" style={{ background: ls.top }} />}
        {b.roof === "antenna" && (
          <div className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2" style={{ background: ls.top }}>
            <span className="absolute -top-1 left-1/2 size-1 -translate-x-1/2 rounded-full" style={{ background: ls.window, boxShadow: `0 0 5px ${ls.window}` }} />
          </div>
        )}
        {b.roof === "step" && <div className="absolute bottom-0 left-1 h-2.5 w-1/2 rounded-t-sm" style={{ background: ls.top }} />}
        {b.roof === "pitch" && (
          <div className="absolute bottom-0 left-0 h-0 w-0" style={{ borderLeft: `${b.w / 2}px solid transparent`, borderRight: `${b.w / 2}px solid transparent`, borderBottom: `12px solid ${ls.top}` }} />
        )}
      </div>
      {/* body with vertical gradient + warm rooftop rim-light */}
      <div
        className="relative flex-1 overflow-hidden rounded-t-[3px]"
        style={{
          background: `linear-gradient(180deg, ${ls.top} 0%, ${ls.top} 45%, ${ls.base} 100%)`,
          boxShadow: `inset 0 2px 0 ${ls.window}33, inset 0 -20px 26px -16px ${ls.window}55`,
        }}
      >
        {/* sunlit edge sheen */}
        <div className="absolute inset-y-0 left-0 w-1/3" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
        {/* window grid */}
        <div className="absolute inset-x-1.5 bottom-2 top-2 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${b.cols}, 1fr)`, gridTemplateRows: `repeat(${b.rows}, 1fr)` }}>
          {b.lit.map((on, i) =>
            on ? (
              <span
                key={i}
                className="rounded-[1px]"
                style={{ background: ls.window, animation: `ddWindow ${4 + (b.delays[i] % 3)}s ease-in-out ${b.delays[i]}s infinite`, boxShadow: `0 0 5px ${ls.window}` }}
              />
            ) : (
              <span key={i} className="rounded-[1px]" style={{ background: "rgba(0,0,0,0.28)" }} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ buildings, ls, className, align = "end" }: { buildings: Building[]; ls: LayerStyle; className?: string; align?: "start" | "end" }) {
  return (
    <div className={`flex justify-between ${align === "end" ? "items-end" : "items-start"} ${className ?? ""}`}>
      {buildings.map((b) => (
        <BuildingShape key={b.id} b={b} ls={ls} />
      ))}
    </div>
  );
}

/** A premium, multi-layer city silhouette with rim-lit roofs, warm windows,
 *  and a wet-street reflection of the lights. */
export function Skyline({ theme }: { theme: "dark" | "light" }) {
  const farFar = useMemo(() => makeRow(3, 20, 50, 110), []);
  const back = useMemo(() => makeRow(7, 16, 80, 160), []);
  const front = useMemo(() => makeRow(91, 13, 120, 240), []);
  const reflections = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const r = ((i * 73 + 17) % 100) / 100;
        return { left: (i / 22) * 100 + r * 2, w: 3 + Math.round(r * 7), o: 0.18 + r * 0.32 };
      }),
    [],
  );

  const dark = theme === "dark";
  const farFarLS: LayerStyle = { top: dark ? "#1a1638" : "#6a5670", base: dark ? "#241d44" : "#7a6680", window: dark ? "#caa6d8" : "#e0a0c0" };
  const backLS: LayerStyle = { top: dark ? "#120e2a" : "#4a3a55", base: dark ? "#1c1638" : "#5e4a64", window: dark ? "#ffbf6a" : "#ff9a52" };
  const frontLS: LayerStyle = { top: dark ? "#070510" : "#241a2c", base: dark ? "#130d22" : "#382a40", window: dark ? "#ffc870" : "#ff8f48" };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36vh] min-h-[230px]">
      {/* farthest, hazy depth */}
      <Row buildings={farFar} ls={farFarLS} className="absolute inset-x-0 bottom-[12vh] px-[3vw] opacity-50 blur-[1.2px]" />
      {/* far, hazier layer */}
      <Row buildings={back} ls={backLS} className="absolute inset-x-0 bottom-[7vh] px-[2vw] opacity-80 blur-[0.4px]" />
      {/* near, crisp silhouette */}
      <Row buildings={front} ls={frontLS} className="absolute inset-x-0 bottom-[6vh] px-[1vw]" />

      {/* wet-street reflection — warm light columns shimmering on the pavement */}
      <div
        className="absolute inset-x-0 bottom-0 h-[6vh] overflow-hidden"
        style={{ maskImage: "linear-gradient(180deg, black, transparent 92%)", WebkitMaskImage: "linear-gradient(180deg, black, transparent 92%)" }}
      >
        {reflections.map((r, i) => (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{
              left: `${r.left}%`,
              width: r.w,
              filter: "blur(2.5px)",
              opacity: r.o,
              background: `linear-gradient(180deg, ${frontLS.window}, transparent 85%)`,
              animation: `ddTwinkle ${5 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
        {/* horizontal wet sheen */}
        <div className="absolute inset-0 opacity-50" style={{ background: "repeating-linear-gradient(90deg, transparent 0 44px, rgba(255,180,84,0.05) 44px 46px)" }} />
      </div>

      {/* street-level warm bleed */}
      <div className="absolute inset-x-0 bottom-0 h-[7vh]" style={{ background: dark ? "linear-gradient(180deg, transparent, rgba(255,150,80,0.14))" : "linear-gradient(180deg, transparent, rgba(255,150,80,0.18))" }} />
    </div>
  );
}
