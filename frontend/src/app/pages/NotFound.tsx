import { Link } from "react-router";
import { MagneticButton } from "../components/dusk/MagneticButton";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-5 text-center">
      <div>
        {/* a sun setting below the horizon */}
        <div className="relative mx-auto h-36 w-72 overflow-hidden">
          {/* reflected glow */}
          <div className="absolute bottom-0 left-1/2 h-24 w-48 -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(255,150,70,0.4), transparent 70%)", filter: "blur(8px)" }} />
          {/* half sun */}
          <div className="absolute bottom-0 left-1/2 size-36 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle at 50% 30%, #fff6d6 0%, #ffd06a 38%, #ff8a4d 70%, #e2502a 100%)", boxShadow: "0 0 60px 6px rgba(255,140,70,0.5)" }} />
          {/* horizon line */}
          <div className="absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--ink-dim)]/60 to-transparent" />
        </div>
        <div className="tnum mt-6 font-display text-6xl font-semibold text-[var(--ink)]">404</div>
        <h1 className="mt-2 font-display text-2xl text-[var(--ink)]">This one's already set.</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--ink-dim)]">
          The page you're after has dropped below the horizon. But there's always another last call nearby.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/"><MagneticButton variant="outline">Back home</MagneticButton></Link>
          <Link to="/discover"><MagneticButton>Find food near you</MagneticButton></Link>
        </div>
      </div>
    </div>
  );
}
