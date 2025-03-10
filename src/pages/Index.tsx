
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";

// Lazy-loaded components
const AlbumView = lazy(() => import("@/components/AlbumView"));
const InventoryView = lazy(() => import("@/components/InventoryView"));
const ExchangeView = lazy(() => import("@/components/ExchangeView"));
const ScanView = lazy(() => import("@/components/ScanView"));
const IntakeHistoryView = lazy(() => import("@/components/inventory/IntakeHistoryView"));
const ClubsPage = lazy(() => import("@/pages/ClubsPage"));

// Loading fallback for route components
const PageLoadingFallback = () => (
  <div className="w-full py-12 flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
      <div className="h-3 w-24 bg-primary/20 rounded"></div>
    </div>
  </div>
);

// Route change tracker for persisting album selection
const RouteChangeTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // When route changes, store the current location
    localStorage.setItem('lastRoute', location.pathname);
  }, [location]);
  
  return null;
};

const Index = () => {
  return (
    <Router>
      <Layout>
        <RouteChangeTracker />
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<AlbumView />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/inventory/history" element={<IntakeHistoryView />} />
            <Route path="/exchange" element={<ExchangeView />} />
            <Route path="/scan" element={<ScanView />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default Index;
