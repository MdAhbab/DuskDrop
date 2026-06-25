import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router";
import { ThemeProvider } from "./lib/theme";
import { DuskSky } from "./components/dusk/DuskSky";
import { GrainOverlay } from "./components/dusk/GrainOverlay";
import { Nav } from "./components/dusk/Nav";
import { Toaster } from "./components/ui/sonner";

import Landing from "./pages/Landing";
import Discover from "./pages/Discover";
import ListingDetail from "./pages/ListingDetail";
import Reservation from "./pages/Reservation";
import Impact from "./pages/Impact";
import FlockAlerts from "./pages/FlockAlerts";
import SurpriseBag from "./pages/SurpriseBag";
import Vendor from "./pages/Vendor";
import ModuleShowcase from "./pages/ModuleShowcase";
import NotFound from "./pages/NotFound";

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
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
