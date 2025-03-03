
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import AlbumView from "@/components/AlbumView";
import InventoryView from "@/components/InventoryView";
import ExchangeView from "@/components/ExchangeView";
import ScanView from "@/components/ScanView";

const Index = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AlbumView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/exchange" element={<ExchangeView />} />
          <Route path="/scan" element={<ScanView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default Index;
