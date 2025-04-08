
import { useQuery } from "@tanstack/react-query";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { useStickerSort } from "./useStickerSort";
import { useEffect } from "react";
import { StorageEvents } from "@/lib/sync/constants";

/**
 * Custom hook for fetching and sorting stickers for a selected album
 */
export const useStickerFetch = (selectedAlbumId: string, refreshKey: number) => {
  const { 
    data: stickers = [], 
    isLoading: isStickersLoading,
    refetch
  } = useQuery({
    queryKey: ['stickers', selectedAlbumId, refreshKey],
    queryFn: () => {
      if (!selectedAlbumId) return [];
      
      console.log(`Fetching stickers for album ${selectedAlbumId} from hook`);
      const albumStickers = getStickersByAlbumId(selectedAlbumId);
      console.log(`Hook found ${albumStickers.length} stickers for album ${selectedAlbumId}`);
      
      // Sort stickers using helper function
      return useStickerSort(albumStickers);
    },
    enabled: !!selectedAlbumId,
    staleTime: 30000, // Reduce stale time to 30 seconds to refresh more often
    refetchOnWindowFocus: true // Enable refetching when window regains focus
  });

  // Effect to handle import completion and force refetch
  useEffect(() => {
    const handleImportComplete = (e: CustomEvent) => {
      const { albumId, count } = e.detail || {};
      
      if (albumId === selectedAlbumId) {
        console.log(`Import complete detected for current album ${selectedAlbumId}, refetching...`);
        refetch(); // Force refetch when import completes for this album
      }
    };
    
    // Listen for the import complete event
    window.addEventListener(
      StorageEvents.IMPORT_COMPLETE,
      handleImportComplete as EventListener
    );
    
    // Also refetch on general data change events
    const handleDataChanged = () => {
      console.log('Data changed event received, refetching stickers');
      refetch();
    };
    
    window.addEventListener(
      StorageEvents.DATA_CHANGED,
      handleDataChanged
    );
    
    window.addEventListener(
      'forceRefresh',
      handleDataChanged
    );
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener(
        StorageEvents.IMPORT_COMPLETE,
        handleImportComplete as EventListener
      );
      
      window.removeEventListener(
        StorageEvents.DATA_CHANGED,
        handleDataChanged
      );
      
      window.removeEventListener(
        'forceRefresh',
        handleDataChanged
      );
    };
  }, [selectedAlbumId, refetch]);

  return {
    stickers,
    isStickersLoading,
    refetch // Export refetch to allow parent components to trigger refreshes
  };
};
