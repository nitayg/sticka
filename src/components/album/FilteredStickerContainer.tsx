
import { useEffect, useMemo, useState } from "react";
import { Sticker } from "@/lib/types";
import StickerCollection from "../StickerCollection";
import { useToast } from "@/components/ui/use-toast";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

interface FilteredStickerContainerProps {
  stickers: Sticker[];
  selectedAlbumId: string;
  showAllAlbumStickers: boolean;
  viewMode: "grid" | "list" | "compact";
  showImages: boolean;
  onRefresh: () => void;
  transactionMap: Record<string, { person: string, color: string }>;
  isLoading: boolean;
}

const FilteredStickerContainer = ({
  stickers,
  selectedAlbumId,
  showAllAlbumStickers,
  viewMode,
  showImages,
  onRefresh,
  transactionMap,
  isLoading
}: FilteredStickerContainerProps) => {
  const { toast } = useToast();
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
        if (stickers.length === 0) {
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
  }, [selectedAlbumId]);

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
          if (fetchedStickers.length > 0 && stickers.length === 0) {
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
        if (stickers.length === 0 && fetchedStickers.length > 0) {
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
    
    return () => {
      window.removeEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh);
      window.removeEventListener('albumDataChanged', handleForceRefresh);
    };
  }, [selectedAlbumId, onRefresh, stickers.length]);

  // Sort stickers by number regardless of the source
  const sortedStickers = useMemo(() => {
    // Choose the source (direct stickers or props)
    const sourceStickers = (localDirectFetch && directStickers.length > 0) 
                          ? directStickers
                          : stickers;
    
    if (sourceStickers.length === 0) {
      return [];
    }
    
    // Always sort by number
    return [...sourceStickers].sort((a, b) => a.number - b.number);
  }, [stickers, directStickers, localDirectFetch]);

  return (
    <StickerCollection 
      stickers={sortedStickers}
      viewMode={viewMode}
      showImages={showImages}
      selectedAlbum={selectedAlbumId}
      onRefresh={onRefresh}
      showMultipleAlbums={showAllAlbumStickers}
      transactionMap={transactionMap}
    />
  );
};

export default FilteredStickerContainer;
