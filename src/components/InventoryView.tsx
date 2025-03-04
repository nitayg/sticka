
import { Plus, List } from "lucide-react";
import Header from "./Header";
import EmptyState from "./EmptyState";
import StickerCollection from "./StickerCollection";
import StickerIntakeForm from "./StickerIntakeForm";
import { Button } from "./ui/button";
import InventoryFilters from "./inventory/InventoryFilters";
import InventoryStats from "./inventory/InventoryStats";
import InventoryTitle from "./inventory/InventoryTitle";
import useInventory from "@/hooks/useInventory";

const InventoryView = () => {
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
    filteredStickers,
    tabStats,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake
  } = useInventory();

  return (
    <div className="space-y-3 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
        action={
          <Button 
            onClick={() => setIsIntakeFormOpen(true)}
            className="px-2 py-1.5 h-8 text-xs rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            הוספה
          </Button>
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
      
      {filteredStickers.length > 0 ? (
        <StickerCollection 
          stickers={filteredStickers}
          viewMode={viewMode}
          showImages={showImages}
          selectedAlbum={selectedAlbumId}
          onRefresh={handleRefresh}
          activeFilter={activeTab === "all" ? null : activeTab}
          showMultipleAlbums={false}
        />
      ) : (
        <EmptyState
          icon={<List className="h-10 w-10" />}
          title="לא נמצאו מדבקות"
          description={`אין מדבקות בקטגוריה "${activeTab}".`}
          action={
            <Button 
              onClick={() => setIsIntakeFormOpen(true)}
              className="px-3 py-1.5 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              הוספת מדבקה
            </Button>
          }
        />
      )}

      <StickerIntakeForm 
        isOpen={isIntakeFormOpen}
        onClose={() => setIsIntakeFormOpen(false)}
        onIntake={handleStickerIntake}
      />
    </div>
  );
};

export default InventoryView;
