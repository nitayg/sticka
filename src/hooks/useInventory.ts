
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllAlbums, 
  getStickersByAlbumId,
  addStickersToInventory
} from "@/lib/data";

export default function useInventory() {
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

  return {
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
  };
}
