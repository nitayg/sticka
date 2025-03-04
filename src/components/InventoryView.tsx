import { useState, useEffect } from "react";
import { stickers } from "@/lib/data";
import { cn } from "@/lib/utils";
import Header from "./Header";
import { List, Plus } from "lucide-react";
import EmptyState from "./EmptyState";
import ViewModeToggle from "./ViewModeToggle";
import StickerCollection from "./StickerCollection";
import StickerIntakeForm from "./StickerIntakeForm";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllAlbums, 
  getStickersByAlbumId, 
  addStickersToInventory 
} from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
      
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="w-64">
          <Select
            value={selectedAlbumId}
            onValueChange={handleAlbumChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר אלבום" />
            </SelectTrigger>
            <SelectContent>
              {albums.map(album => (
                <SelectItem key={album.id} value={album.id}>
                  {album.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ViewModeToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-up">
        <InventoryCard 
          title="סך הכל" 
          value={tabStats.all} 
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        />
        <InventoryCard 
          title="ברשותי" 
          value={tabStats.owned} 
          active={activeTab === "owned"}
          onClick={() => setActiveTab("owned")}
        />
        <InventoryCard 
          title="חסרים" 
          value={tabStats.needed} 
          active={activeTab === "needed"}
          onClick={() => setActiveTab("needed")}
        />
        <InventoryCard 
          title="כפולים" 
          value={tabStats.duplicates} 
          active={activeTab === "duplicates"}
          onClick={() => setActiveTab("duplicates")}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          {activeTab === "all" && "כל המדבקות"}
          {activeTab === "owned" && "מדבקות ברשותי"}
          {activeTab === "needed" && "מדבקות חסרות"}
          {activeTab === "duplicates" && "מדבקות כפולות"}
        </h2>
      </div>
      
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

interface InventoryCardProps {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}

const InventoryCard = ({ title, value, active, onClick }: InventoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl p-4 text-right transition-all duration-300",
        "border",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={cn(
        "text-2xl font-bold mt-1",
        active ? "text-interactive" : "text-foreground"
      )}>
        {value}
      </div>
    </button>
  );
};

export default InventoryView;
