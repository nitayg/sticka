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
  
  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums
  });
  
  const { data: albumStickers = [] } = useQuery({
    queryKey: ['stickers', selectedAlbumId],
    queryFn: () => fetchStickersByAlbumId(selectedAlbumId),
    enabled: !!selectedAlbumId,
  });
  
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  const filteredStickers = albumStickers.filter(sticker => {
    if (activeTab === "all") return true;
    if (activeTab === "owned") return sticker.isOwned;
    if (activeTab === "needed") return !sticker.isOwned;
    if (activeTab === "duplicates") return sticker.isDuplicate && sticker.isOwned;
    return true;
  });
  
  const tabStats = {
    all: albumStickers.length,
    owned: albumStickers.filter(s => s.isOwned).length,
    needed: albumStickers.filter(s => !s.isOwned).length,
    duplicates: albumStickers.filter(s => s.isDuplicate && s.isOwned).length
  };
  
  const handleStickerIntakeSubmit = async (albumId: string, stickerNumbers: number[]) => {
    try {
      const results = await handleStickerIntake(albumId, stickerNumbers);
      
      const totalUpdated = results.newlyOwned.length + results.duplicatesUpdated.length;
      
      let message = `נוספו ${totalUpdated} מדבקות למלאי.`;
      if (results.newlyOwned.length > 0) {
        message += ` ${results.newlyOwned.length} מדבקות חדשות.`;
      }
      if (results.duplicatesUpdated.length > 0) {
        message += ` ${results.duplicatesUpdated.length} מדבקות כפולות עודכנו.`;
      }
      if (results.notFound.length > 0) {
        message += ` ${results.notFound.length} מדבקות לא נמצאו.`;
      }
      
      toast({
        title: "מדבקות נוספו למלאי",
        description: message,
      });
      
      handleRefresh();
    } catch (error) {
      console.error("Error adding stickers to inventory:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המדבקות למלאי",
        variant: "destructive"
      });
    }
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
