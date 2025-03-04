
import { useState, useEffect } from "react";
import { List, Plus } from "lucide-react";
import Header from "./Header";
import EmptyState from "./EmptyState";
import StickerCollection from "./StickerCollection";
import StickerIntakeForm from "./StickerIntakeForm";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllAlbums, 
  getStickersByAlbumId,
} from "@/lib/data";
import { addStickersToInventory } from "@/lib/sticker-operations";
import InventoryFilters from "./inventory/InventoryFilters";
import InventoryStats from "./inventory/InventoryStats";
import InventoryTitle from "./inventory/InventoryTitle";

const InventoryView = () => {
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "needed" | "duplicates">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [showImages, setShowImages] = useState(true);
  const [isIntakeFormOpen, setIsIntakeFormOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [albumStickers, setAlbumStickers] = useState<any[]>([]);
  const { toast } = useToast();
  
  const albums = getAllAlbums();
  
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(albums[0].id);
    }
  }, [albums, selectedAlbumId]);

  useEffect(() => {
    if (selectedAlbumId) {
      setAlbumStickers(getStickersByAlbumId(selectedAlbumId));
    }
  }, [selectedAlbumId]);
  
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

  const handleRefresh = () => {
    if (selectedAlbumId) {
      setAlbumStickers(getStickersByAlbumId(selectedAlbumId));
    }
    toast({
      title: "המלאי עודכן",
      description: "הנתונים עודכנו בהצלחה",
    });
  };

  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbumId(albumId);
  };

  const handleStickerIntake = (albumId: string, stickerNumbers: number[]) => {
    const results = addStickersToInventory(albumId, stickerNumbers);
    
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
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
        action={
          <Button 
            onClick={() => setIsIntakeFormOpen(true)}
            className="px-3 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
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
          icon={<List className="h-12 w-12" />}
          title="לא נמצאו מדבקות"
          description={`אין מדבקות בקטגוריה "${activeTab}".`}
          action={
            <Button 
              onClick={() => setIsIntakeFormOpen(true)}
              className="px-4 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              הוספת מדבקה
            </Button>
          }
        />
      )}

      <StickerIntakeForm 
        isOpen={isIntakeFormOpen}
        onClose={() => setIsIntakeFormOpen(false)}
        onIntake={(albumId, stickerNumbers) => {
          handleStickerIntake(albumId, stickerNumbers);
          setIsIntakeFormOpen(false);
        }}
      />
    </div>
  );
};

export default InventoryView;
