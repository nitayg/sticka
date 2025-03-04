
import { useEffect } from "react";
import { Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "./Header";
import EmptyState from "./EmptyState";
import StickerCollection from "./StickerCollection";
import StickerIntakeForm from "./StickerIntakeForm";
import { Button } from "./ui/button";
import InventoryFilters from "./inventory/InventoryFilters";
import InventoryStats from "./inventory/InventoryStats";
import InventoryTitle from "./inventory/InventoryTitle";
import { useInventoryStore } from "@/store/useInventoryStore";
import { getAllAlbums } from "@/lib/data";
import { fetchStickersByAlbumId } from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";

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
    transactionMap,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake
  } = useInventoryStore();
  
  const { toast } = useToast();
  
  // Get albums (won't change often)
  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums
  });
  
  // Get stickers for selected album
  const { data: albumStickers = [] } = useQuery({
    queryKey: ['stickers', selectedAlbumId],
    queryFn: () => fetchStickersByAlbumId(selectedAlbumId),
    enabled: !!selectedAlbumId,
  });
  
  // Set default album if none selected
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Filter stickers based on active tab
  const filteredStickers = albumStickers.filter(sticker => {
    if (activeTab === "all") return true;
    if (activeTab === "owned") return sticker.isOwned;
    if (activeTab === "needed") return !sticker.isOwned;
    if (activeTab === "duplicates") return sticker.isDuplicate && sticker.isOwned;
    return true;
  });
  
  // Calculate tab stats
  const tabStats = {
    all: albumStickers.length,
    owned: albumStickers.filter(s => s.isOwned).length,
    needed: albumStickers.filter(s => !s.isOwned).length,
    duplicates: albumStickers.filter(s => s.isDuplicate && s.isOwned).length
  };
  
  const handleStickerIntakeSubmit = (albumId: string, stickerNumbers: number[]) => {
    const results = handleStickerIntake(albumId, stickerNumbers);
    
    const totalUpdated = results.newlyOwned + results.duplicatesUpdated;
    
    let message = `נוספו ${totalUpdated} מדבקות למלאי.`;
    if (results.newlyOwned > 0) {
      message += ` ${results.newlyOwned} מדבקות חדשות.`;
    }
    if (results.duplicatesUpdated > 0) {
      message += ` ${results.duplicatesUpdated} מדבקות כפולות עודכנו.`;
    }
    if (results.notFound > 0) {
      message += ` ${results.notFound} מדבקות לא נמצאו.`;
    }
    
    toast({
      title: "מדבקות נוספו למלאי",
      description: message,
    });
    
    handleRefresh();
  };

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
          transactionMap={transactionMap}
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
        onIntake={handleStickerIntakeSubmit}
      />
    </div>
  );
};

export default InventoryView;
