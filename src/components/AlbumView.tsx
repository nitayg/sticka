
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
    albums, 
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
  const isDesktop = window.innerWidth >= 768;
  
  useEffect(() => {
    if (isIOS) {
      setViewMode('compact');
    } else if (isDesktop) {
      setViewMode('grid');
    }
  }, [isIOS, isDesktop, setViewMode]);
  
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        handleAlbumChange(lastSelectedAlbum);
      } else {
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
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
      
      <div className="pb-2"> {/* הקטנה משמעותית של ה-padding */}
        <FilteredStickerContainer
          stickers={stickers}
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
