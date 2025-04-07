
import { useEffect } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import AlbumEventHandler from "./album/AlbumEventHandler";
import { useAlbumData } from "@/hooks/useAlbumData";
import EmptyState from "./EmptyState";
import { Album } from "lucide-react";
import AddAlbumForm from "./add-album-form";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import { toast } from "./ui/use-toast";

const AlbumView = () => {
  const {
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    selectedAlbumId,
    refreshKey,
    handleRefresh,
    handleAlbumChange,
  } = useAlbumStore();
  
  const { 
    albums = [], // Provide default empty array to fix TypeScript errors
    stickers, 
    transactionMap, 
    isLoading
  } = useAlbumData({ 
    selectedAlbumId, 
    refreshKey,
    activeTab: "number", // Default to number tab
    showAllAlbumStickers: false // Default not showing all album stickers
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  useEffect(() => {
    if (isIOS) {
      setViewMode('compact');
    }
  }, [isIOS, setViewMode]);
  
  // Improved logging to help troubleshoot
  useEffect(() => {
    console.log("[AlbumView] Albums:", albums);
    console.log("[AlbumView] Selected album:", selectedAlbumId);
    console.log("[AlbumView] isLoading:", isLoading);
  }, [albums, selectedAlbumId, isLoading]);
  
  // Enhanced error handling when selecting album
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      console.log("[AlbumView] Last selected album:", lastSelectedAlbum);
      
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        console.log("[AlbumView] Restoring previous album selection:", lastSelectedAlbum);
        handleAlbumChange(lastSelectedAlbum);
      } else {
        console.log("[AlbumView] Selecting first album:", albums[0].id);
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Force a refresh if we have no albums but should have
  useEffect(() => {
    if (albums.length === 0 && !isLoading) {
      // Try to force a refresh after a brief delay
      const timer = setTimeout(() => {
        console.log("[AlbumView] No albums found, forcing refresh");
        handleRefresh();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [albums, isLoading, handleRefresh]);
  
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
  // Listen for inventory changes to refresh stickers
  useEffect(() => {
    const handleInventoryChanged = () => {
      console.log("Inventory data changed event received in AlbumView");
      handleRefresh();
    };
    
    window.addEventListener('inventoryDataChanged', handleInventoryChanged);
    return () => {
      window.removeEventListener('inventoryDataChanged', handleInventoryChanged);
    };
  }, [handleRefresh]);
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (albums.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in p-4">
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
    <div className="space-y-2 animate-fade-in">
      {selectedAlbumId && <AlbumEventHandler album={albums.find(a => a.id === selectedAlbumId)} />}
      
      <FilterControls
        albums={albums}
        selectedAlbum={selectedAlbumId}
        handleAlbumChange={handleAlbumChange}
        onTeamsManage={() => {}} // Empty function since we're removing tabs
      />
      
      <div className="pb-16">
        <FilteredStickerContainer
          stickers={stickers || []} // Provide default empty array
          selectedAlbumId={selectedAlbumId}
          viewMode={viewMode}
          showImages={showImages}
          onRefresh={handleRefresh}
          transactionMap={transactionMap}
          activeTab="number" // Default to number tab
          selectedRange={null}
          selectedTeam={null}
          showAllAlbumStickers={false}
        />
      </div>
    </div>
  );
};

export default AlbumView;
