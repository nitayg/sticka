
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";

// Lazy-loaded components
const AlbumView = lazy(() => import("@/components/AlbumView"));
const InventoryView = lazy(() => import("@/components/InventoryView"));
const ExchangeView = lazy(() => import("@/components/ExchangeView"));
const ScanView = lazy(() => import("@/components/ScanView"));

// Loading fallback for route components
const PageLoadingFallback = () => (
  <div className="w-full py-12 flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
      <div className="h-3 w-24 bg-primary/20 rounded"></div>
    </div>
  </div>
);

const Index = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<AlbumView />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/exchange" element={<ExchangeView />} />
            <Route path="/scan" element={<ScanView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default Index;
