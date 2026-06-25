import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router";
import { ThemeProvider } from "./lib/theme";
import { DuskSky } from "./components/dusk/DuskSky";
import { GrainOverlay } from "./components/dusk/GrainOverlay";
import { Nav } from "./components/dusk/Nav";
import { Toaster } from "./components/ui/sonner";

// Routes are code-split so the initial bundle stays small and heavy pages
// (charts, vendor console) only load when visited. Landing is eager — it's
// the most common entry point.
import Landing from "./pages/Landing";
const Discover = lazy(() => import("./pages/Discover"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Reservation = lazy(() => import("./pages/Reservation"));
const Impact = lazy(() => import("./pages/Impact"));
const FlockAlerts = lazy(() => import("./pages/FlockAlerts"));
const SurpriseBag = lazy(() => import("./pages/SurpriseBag"));
const Vendor = lazy(() => import("./pages/Vendor"));
const ModuleShowcase = lazy(() => import("./pages/ModuleShowcase"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ember)] border-t-transparent" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative min-h-screen text-[var(--ink)]">
          <DuskSky />
          <GrainOverlay />
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/reserve/:id" element={<Reservation />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/alerts" element={<FlockAlerts />} />
                <Route path="/surprise" element={<SurpriseBag />} />
                <Route path="/vendor" element={<Vendor />} />
                <Route path="/module" element={<ModuleShowcase />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
