
import { useEffect, useState, useCallback } from "react";
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
  
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [forceRefreshCount, setForceRefreshCount] = useState(0);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
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
    console.log("[AlbumView] Force refresh count:", forceRefreshCount);
  }, [albums, selectedAlbumId, isLoading, forceRefreshCount]);
  
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
  
  // Throttled refresh function to prevent excessive API calls
  const throttledRefresh = useCallback(() => {
    const lastRefreshTime = parseInt(localStorage.getItem('lastRefreshTimestamp') || '0');
    const now = Date.now();
    
    // Only allow refresh every 10 seconds to prevent EGRESS abuse
    if (now - lastRefreshTime > 10000) {
      localStorage.setItem('lastRefreshTimestamp', now.toString());
      handleRefresh();
      setForceRefreshCount(count => count + 1);
      
      // Show a toast only on explicit refreshes
      if (forceRefreshCount > 1) {
        toast({
          title: "נסיון לטעון אלבומים",
          description: "מנסה לטעון את האלבומים שלך...",
        });
      }
    } else {
      console.log("[AlbumView] Refresh throttled to prevent EGRESS abuse");
    }
  }, [forceRefreshCount, handleRefresh]);
  
  // Force a refresh if we have no albums but should have
  useEffect(() => {
    if (albums.length === 0 && !isLoading && !hasAttemptedRefresh) {
      // Only try to force refresh once to avoid infinite loops
      console.log("[AlbumView] No albums found, forcing refresh");
      setHasAttemptedRefresh(true);
      
      // Add a small delay before refreshing
      const timer = setTimeout(() => {
        throttledRefresh();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [albums, isLoading, throttledRefresh, hasAttemptedRefresh]);
  
  // Reset the refresh attempt flag if loading state changes or albums are loaded
  useEffect(() => {
    if (isLoading || albums.length > 0) {
      setHasAttemptedRefresh(false);
    }
  }, [isLoading, albums]);
  
  // Set a timeout on loading to prevent infinite loading states
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 10000); // Show timeout message after 10 seconds of loading
      
      return () => clearTimeout(timer);
    } else {
      setIsLoadingTimeout(false);
    }
  }, [isLoading]);
  
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
  // Listen for inventory changes to refresh stickers
  useEffect(() => {
    const handleInventoryChanged = () => {
      console.log("Inventory data changed event received in AlbumView");
      throttledRefresh();
    };
    
    window.addEventListener('inventoryDataChanged', handleInventoryChanged);
    return () => {
      window.removeEventListener('inventoryDataChanged', handleInventoryChanged);
    };
  }, [throttledRefresh]);
  
  // Show more detailed loading indicator with timeout
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-center p-12 flex-col">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <div className="text-sm text-muted-foreground">טוען אלבומים...</div>
          
          {isLoadingTimeout && (
            <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md text-center max-w-md">
              <p className="font-semibold">הטעינה אורכת זמן רב</p>
              <p className="text-xs mt-1">ייתכן שיש בעיה בחיבור לשרת או בטעינת הנתונים.</p>
              <button 
                onClick={throttledRefresh}
                className="mt-2 px-4 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md text-sm font-medium transition-colors"
              >
                נסה שוב
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Show a different state after multiple refresh attempts
  if (albums.length === 0 && (forceRefreshCount >= 3 || isLoadingTimeout)) {
    return (
      <div className="space-y-4 animate-fade-in p-4">
        <EmptyState
          icon={<Album className="h-12 w-12" />}
          title="לא ניתן לטעון אלבומים"
          description="לא הצלחנו לטעון את האלבומים שלך. אנא נסה לרענן את הדף או להוסיף אלבום חדש."
          action={
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setForceRefreshCount(0);
                  setHasAttemptedRefresh(false);
                  throttledRefresh();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                נסה שוב
              </button>
              <div className="pt-2">
                <AddAlbumForm onAlbumAdded={throttledRefresh} />
              </div>
            </div>
          }
        />
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
            <AddAlbumForm onAlbumAdded={throttledRefresh} />
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
