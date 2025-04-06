
import { useEffect } from "react";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

/**
 * Hook to handle sticker data change events
 */
export const useStickerEvents = (
  selectedAlbumId: string,
  onRefresh: () => void,
  propsStickersLength: number,
  setDirectStickers: (stickers: any[]) => void,
  setLocalDirectFetch: (fetch: boolean) => void
) => {
  // Listen for sticker data change events
  useEffect(() => {
    const handleStickerDataChanged = (e: CustomEvent) => {
      const detail = e.detail || {};
      const eventAlbumId = detail.albumId;
      const action = detail.action;
      const count = detail.count;
      
      console.log(`Sticker data changed event: albumId=${eventAlbumId}, action=${action}, count=${count}`);
      
      // If the event is for our selected album or no specific album was mentioned
      if (!eventAlbumId || eventAlbumId === selectedAlbumId) {
        console.log(`Refreshing stickers for album ${selectedAlbumId} due to sticker data change`);
        
        // Fetch the latest stickers directly
        if (selectedAlbumId) {
          const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
          console.log(`After sticker data changed: fetched ${fetchedStickers.length} stickers directly for album ${selectedAlbumId}`);
          setDirectStickers(fetchedStickers);
          
          // If we have stickers but the props is empty, set local fetch to true
          if (fetchedStickers.length > 0 && propsStickersLength === 0) {
            setLocalDirectFetch(true);
          }
          
          // Notify the parent component to refresh
          onRefresh();
        }
      }
    };
    
    const handleForceRefresh = () => {
      console.log("Force refresh triggered in FilteredStickerContainer");
      
      // Always fetch the latest stickers on force refresh
      if (selectedAlbumId) {
        const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
        console.log(`Force refresh: fetched ${fetchedStickers.length} stickers for album ${selectedAlbumId}`);
        setDirectStickers(fetchedStickers);
        
        // If props stickers are empty but we found stickers directly, use our direct stickers
        if (propsStickersLength === 0 && fetchedStickers.length > 0) {
          setLocalDirectFetch(true);
        }
      }
      
      // Notify parent
      onRefresh();
    };
    
    // Register event listeners
    window.addEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
    window.addEventListener('forceRefresh', handleForceRefresh);
    window.addEventListener('albumDataChanged', handleForceRefresh);
    window.addEventListener('inventoryDataChanged', handleForceRefresh);
    
    return () => {
      window.removeEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh);
      window.removeEventListener('albumDataChanged', handleForceRefresh);
      window.removeEventListener('inventoryDataChanged', handleForceRefresh);
    };
  }, [selectedAlbumId, onRefresh, propsStickersLength, setDirectStickers, setLocalDirectFetch]);
};
