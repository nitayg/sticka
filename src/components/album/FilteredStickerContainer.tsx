
import { useEffect, useMemo, useState } from "react";
import { Sticker } from "@/lib/types";
import StickerCollection from "../StickerCollection";
import { useToast } from "@/components/ui/use-toast";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

interface FilteredStickerContainerProps {
  stickers: Sticker[];
  selectedAlbumId: string;
  activeTab: "number" | "team" | "manage";
  selectedRange: string | null;
  selectedTeam: string | null;
  showAllAlbumStickers: boolean;
  viewMode: "grid" | "list" | "compact";
  showImages: boolean;
  onRefresh: () => void;
  transactionMap: Record<string, { person: string, color: string }>;
}

const FilteredStickerContainer = ({
  stickers,
  selectedAlbumId,
  activeTab,
  selectedRange,
  selectedTeam,
  showAllAlbumStickers,
  viewMode,
  showImages,
  onRefresh,
  transactionMap
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
    window.addEventListener('inventoryDataChanged', handleForceRefresh);
    
    return () => {
      window.removeEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh);
      window.removeEventListener('albumDataChanged', handleForceRefresh);
      window.removeEventListener('inventoryDataChanged', handleForceRefresh);
    };
  }, [selectedAlbumId, onRefresh, stickers.length]);

  // Decide which stickers to use and apply filters
  const filteredStickers = useMemo(() => {
    // If we should use direct stickers (when props are empty but direct fetch found stickers)
    const sourceStickers = (localDirectFetch && directStickers.length > 0) 
                          ? directStickers
                          : stickers;
    
    if (sourceStickers.length === 0) {
      return [];
    }
    
    // Apply filters based on the active tab
    let filtered = sourceStickers;
    
    // Filter by number range
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => {
        // Handle both string and number sticker numbers
        const stickerNum = typeof sticker.number === 'string' 
          ? parseInt(sticker.number.replace(/\D/g, ''), 10) || 0 
          : sticker.number;
        return stickerNum >= rangeStart && stickerNum <= rangeEnd;
      });
    } 
    // Filter by team
    else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    // Sort stickers by number
    filtered = [...filtered].sort((a, b) => {
      // Handle both string and number values for sorting
      const numA = typeof a.number === 'string' ? parseInt(a.number.replace(/\D/g, ''), 10) || 0 : a.number;
      const numB = typeof b.number === 'string' ? parseInt(b.number.replace(/\D/g, ''), 10) || 0 : b.number;
      return numA - numB;
    });
    
    return filtered;
  }, [stickers, directStickers, localDirectFetch, activeTab, selectedRange, selectedTeam]);

  return (
    <StickerCollection 
      stickers={filteredStickers}
      viewMode={viewMode}
      showImages={showImages}
      selectedAlbum={selectedAlbumId}
      onRefresh={onRefresh}
      activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
      showMultipleAlbums={showAllAlbumStickers || (activeTab === "manage" && selectedTeam !== null)}
      transactionMap={transactionMap}
    />
  );
};

export default FilteredStickerContainer;
