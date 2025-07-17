
import { useEffect } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import AlbumEventHandler from "./album/AlbumEventHandler";
import { useAlbumData } from "@/hooks/useAlbumData";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import AlbumLoadingState from "./album/loading/AlbumLoadingState";
import AlbumErrorState from "./album/error/AlbumErrorState";
import AlbumEmptyState from "./album/empty/AlbumEmptyState";
import { useAlbumRefresh } from "@/hooks/album/useAlbumRefresh";
import { useAlbumSelection } from "@/hooks/album/useAlbumSelection";
import { useAlbumLoadingEffects } from "@/hooks/album/useAlbumLoadingEffects";
import { useInventoryChangeEvents } from "@/hooks/album/useInventoryChangeEvents";
import AlbumControls from "./album/AlbumControls";

const AlbumView = () => {
  const {
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    selectedAlbumId,
    refreshKey,
    handleAlbumChange,
  } = useAlbumStore();
  
  // Use custom hooks for various functionalities
  const {
    throttledRefresh,
    hasAttemptedRefresh,
    setHasAttemptedRefresh,
    forceRefreshCount,
    isLoadingTimeout,
    setIsLoadingTimeout,
    resetRefresh
  } = useAlbumRefresh();
  
  const { 
    albums = [], 
    stickers, 
    transactionMap, 
    isLoading
  } = useAlbumData({ 
    selectedAlbumId, 
    refreshKey,
    activeTab: "number",
    showAllAlbumStickers: false
  });

  // Handle album selection
  useAlbumSelection(albums);

  // Handle loading effects
  useAlbumLoadingEffects({
    isLoading,
    albums,
    hasAttemptedRefresh,
    setHasAttemptedRefresh,
    throttledRefresh,
    setIsLoadingTimeout
  });

  // Listen for inventory changes
  useInventoryChangeEvents(throttledRefresh);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Set compact view mode for iOS
  useEffect(() => {
    if (isIOS) {
      setViewMode('compact');
    }
  }, [isIOS, setViewMode]);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("[AlbumView] Albums:", albums);
    console.log("[AlbumView] Selected album:", selectedAlbumId);
    console.log("[AlbumView] isLoading:", isLoading);
    console.log("[AlbumView] Force refresh count:", forceRefreshCount);
  }, [albums, selectedAlbumId, isLoading, forceRefreshCount]);
  
  // Show loading state
  if (isLoading) {
    return <AlbumLoadingState 
      isLoadingTimeout={isLoadingTimeout} 
      throttledRefresh={throttledRefresh} 
    />;
  }
  
  // Show error state
  if (albums.length === 0 && (forceRefreshCount >= 3 || isLoadingTimeout)) {
    return <AlbumErrorState 
      resetRefresh={resetRefresh}
      throttledRefresh={throttledRefresh}
    />;
  }
  
  // Show empty state
  if (albums.length === 0) {
    return <AlbumEmptyState onAlbumAdded={throttledRefresh} />;
  }
  
  // Show loaded album view
  return (
    <div className="space-y-2 animate-fade-in">
      {selectedAlbumId && albums.find(a => a.id === selectedAlbumId) && <AlbumEventHandler album={albums.find(a => a.id === selectedAlbumId)!} />}
      
      <AlbumControls
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
          onRefresh={throttledRefresh}
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
