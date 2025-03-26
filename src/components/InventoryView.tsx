
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "./Header";
import StickerIntakeForm from "./StickerIntakeForm";
import { useInventoryStore } from "@/store/useInventoryStore";
import { getAllAlbums } from "@/lib/album-operations";
import { fetchStickersByAlbumId } from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";
import InventoryFilters from "./inventory/InventoryFilters";
import InventoryStats from "./inventory/InventoryStats";
import InventoryTitle from "./inventory/InventoryTitle";
import InventoryHeaderActions from "./inventory/InventoryHeaderActions";
import InventoryContent from "./inventory/InventoryContent";
import EmptyState from "./EmptyState";
import { Album } from "lucide-react";

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
  const [reportFormat, setReportFormat] = useState<'numbers' | 'names'>('numbers');
  const [searchValue, setSearchValue] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showMissing, setShowMissing] = useState(true);
  const [showDuplicated, setShowDuplicated] = useState(true);
  
  const { data: albums = [], isLoading: isAlbumsLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums
  });
  
  const { data: albumStickers = [], isLoading: isStickersLoading } = useQuery({
    queryKey: ['stickers', selectedAlbumId],
    queryFn: () => fetchStickersByAlbumId(selectedAlbumId),
    enabled: !!selectedAlbumId,
  });
  
  useEffect(() => {
    if (albums && albums.length > 0 && !selectedAlbumId) {
      // Try to get last selected album from localStorage
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        handleAlbumChange(lastSelectedAlbum);
      } else {
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Store selected album ID when it changes
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
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
  
  const handleStickerIntakeSubmit = async (albumId: string, stickerNumbers: (number | string)[]) => {
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

  if (isAlbumsLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Header 
          title="מלאי" 
          subtitle="ניהול אוסף המדבקות שלך"
        />
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (albums && albums.length === 0) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Header 
          title="מלאי" 
          subtitle="ניהול אוסף המדבקות שלך"
        />
        <EmptyState
          icon={<Album className="h-12 w-12" />}
          title="אין אלבומים פעילים"
          description="הוסף אלבום חדש כדי להתחיל"
          action={
            <AddAlbumForm onAlbumAdded={handleRefresh} />
          }
        />
      </div>
    );
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
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={handleAlbumChange}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        showMissing={showMissing}
        setShowMissing={setShowMissing}
        showDuplicated={showDuplicated}
        setShowDuplicated={setShowDuplicated}
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
        onIntake={handleStickerIntakeSubmit}
      />
    </div>
  );
};

// Import AddAlbumForm here to avoid circular imports
import AddAlbumForm from "./add-album-form";

export default InventoryView;
