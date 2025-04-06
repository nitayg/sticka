
import { useState, useEffect } from "react";
import { Sticker } from "@/lib/types";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

/**
 * Hook to handle direct fetching of stickers for an album
 */
export const useDirectStickers = (
  selectedAlbumId: string, 
  propsStickers: Sticker[], 
  onRefresh: () => void
) => {
  const [localDirectFetch, setLocalDirectFetch] = useState<boolean>(false);
  const [directStickers, setDirectStickers] = useState<Sticker[]>([]);
  
  // Fetch stickers directly if not provided in props
  useEffect(() => {
    if (selectedAlbumId) {
      // Always fetch stickers directly first time
      const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
      console.log(`Direct stickers fetch returned ${fetchedStickers.length} stickers for album ${selectedAlbumId}`);
      
      if (fetchedStickers.length > 0) {
        setDirectStickers(fetchedStickers);
        
        // If we have stickers but props is empty, set the local fetch flag to use our direct stickers
        if (propsStickers.length === 0) {
          console.log(`No stickers found in props for album ${selectedAlbumId} trying to fetch them directly`);
          setLocalDirectFetch(true);
          // Also trigger the parent refresh to ensure it gets the stickers
          onRefresh();
        }
      }
    } else {
      // Reset when album changes
      setDirectStickers([]);
      setLocalDirectFetch(false);
    }
  }, [selectedAlbumId, propsStickers.length, onRefresh]);

  return {
    localDirectFetch,
    directStickers,
    setDirectStickers,
    setLocalDirectFetch
  };
};
