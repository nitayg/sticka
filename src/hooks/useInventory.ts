
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllAlbums, 
  getStickersByAlbumId,
  addStickersToInventory,
  exchangeOffers
} from "@/lib/data";

export default function useInventory() {
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "needed" | "duplicates">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("compact");
  const [showImages, setShowImages] = useState(true);
  const [isIntakeFormOpen, setIsIntakeFormOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [albumStickers, setAlbumStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactionMap, setTransactionMap] = useState<Record<string, { person: string, color: string }>>({});
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
      updateTransactionMap(selectedAlbumId);
    }
  }, [selectedAlbumId, refreshKey]);
  
  useEffect(() => {
    const handleInventoryDataChanged = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('inventoryDataChanged', handleInventoryDataChanged);
    
    return () => {
      window.removeEventListener('inventoryDataChanged', handleInventoryDataChanged);
    };
  }, []);
  
  const updateTransactionMap = (albumId: string) => {
    const newTransactionMap: Record<string, { person: string, color: string }> = {};
    
    const relevantExchanges = exchangeOffers.filter(exchange => exchange.albumId === albumId);
    
    relevantExchanges.forEach(exchange => {
      const stickerNumbers = exchange.wantedStickerId.map(id => parseInt(id));
      
      const albumStickers = getStickersByAlbumId(albumId);
      
      stickerNumbers.forEach(number => {
        const sticker = albumStickers.find(s => s.number === number);
        if (sticker) {
          newTransactionMap[sticker.id] = {
            person: exchange.userName,
            color: exchange.color || "bg-secondary"
          };
        }
      });
    });
    
    setTransactionMap(newTransactionMap);
  };
  
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
      updateTransactionMap(selectedAlbumId);
    }
    toast({
      title: "המלאי עודכן",
      description: "הנתונים עודכנו בהצלחה",
    });
  };

  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbumId(albumId);
  };

  const handleStickerIntake = (albumId: string, stickerNumbers: (number | string)[]) => {
    const results = addStickersToInventory(albumId, stickerNumbers);
    
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
    
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
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
    transactionMap,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake
  };
}
