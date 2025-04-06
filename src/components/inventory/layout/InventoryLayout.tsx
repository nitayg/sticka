
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../../Header";
import StickerIntakeForm from "../../StickerIntakeForm";
import { useInventoryStore } from "@/store/useInventoryStore";
import { getAllAlbums } from "@/lib/album-operations";
import InventoryLoading from "./InventoryLoading";
import InventoryEmpty from "./InventoryEmpty";
import InventoryFilters from "../InventoryFilters";
import InventoryStats from "../InventoryStats";
import InventoryTitle from "../InventoryTitle";
import InventoryContent from "../InventoryContent";
import InventoryHeaderActions from "../InventoryHeaderActions";
import { useInventoryAlbumSelection } from "../hooks/useInventoryAlbumSelection";
import { useInventoryFilteredStickers } from "../hooks/useInventoryFilteredStickers";

/**
 * Main inventory view component that handles the layout and composition
 * of all inventory-related components
 */
const InventoryLayout = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    isIntakeFormOpen,
    setIsIntakeFormOpen,
    selectedAlbumId,
    transactionMap,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake
  } = useInventoryStore();
  
  const [reportFormat, setReportFormat] = useState<'numbers' | 'names'>('numbers');
  
  // Use a custom hook for album selection
  const { albums, isAlbumsLoading } = useInventoryAlbumSelection({
    selectedAlbumId,
    handleAlbumChange
  });
  
  // Use a custom hook for filtered stickers
  const { 
    albumStickers, 
    isStickersLoading, 
    filteredStickers, 
    tabStats 
  } = useInventoryFilteredStickers({
    selectedAlbumId,
    activeTab
  });
  
  // Show loading state when fetching albums
  if (isAlbumsLoading) {
    return <InventoryLoading />;
  }

  // Show empty state when no albums exist
  if (albums && albums.length === 0) {
    return <InventoryEmpty onAlbumAdded={handleRefresh} />;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
        action={
          <InventoryHeaderActions
            onAddClick={() => setIsIntakeFormOpen(true)}
            albumStickers={albumStickers}
            reportFormat={reportFormat}
            setReportFormat={setReportFormat}
          />
        }
      />
      
      <InventoryFilters
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={handleAlbumChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      
      <InventoryStats 
        stats={tabStats} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <InventoryTitle activeTab={activeTab} />
      
      <InventoryContent
        filteredStickers={filteredStickers}
        viewMode={viewMode}
        showImages={showImages}
        selectedAlbumId={selectedAlbumId}
        handleRefresh={handleRefresh}
        activeTab={activeTab}
        transactionMap={transactionMap}
        setIsIntakeFormOpen={setIsIntakeFormOpen}
      />

      <StickerIntakeForm 
        isOpen={isIntakeFormOpen}
        onClose={() => setIsIntakeFormOpen(false)}
        onIntake={handleStickerIntake}
      />
    </div>
  );
};

// Fix missing import
import { useState } from "react";

export default InventoryLayout;
