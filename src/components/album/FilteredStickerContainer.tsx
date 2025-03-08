
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
  
  // Fetch stickers if not provided in props or if a direct fetch is needed
  useEffect(() => {
    if (selectedAlbumId) {
      if (stickers.length === 0 || localDirectFetch) {
        console.log("Fetching stickers directly for album", selectedAlbumId);
        const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
        
        console.log(`Directly fetched ${fetchedStickers.length} stickers for album ${selectedAlbumId}`);
        setDirectStickers(fetchedStickers);
        
        // If we found stickers directly but stickers in props is empty, trigger refresh
        if (fetchedStickers.length > 0 && stickers.length === 0 && !localDirectFetch) {
          console.log(`Found ${fetchedStickers.length} stickers directly, triggering refresh`);
          setLocalDirectFetch(true);
          onRefresh();
        }
      }
    } else {
      // Reset direct stickers when album changes
      setDirectStickers([]);
      setLocalDirectFetch(false);
    }
  }, [selectedAlbumId, stickers.length, onRefresh, localDirectFetch]);

  // Listen for forced refresh events with more specific handlers
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log("Force refresh triggered in FilteredStickerContainer");
      // Direct fetch on force refresh
      if (selectedAlbumId) {
        const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
        console.log(`Refreshed ${fetchedStickers.length} stickers for album ${selectedAlbumId}`);
        setDirectStickers(fetchedStickers);
      }
      onRefresh();
    };
    
    const handleStickerDataChanged = (e: CustomEvent) => {
      const eventAlbumId = e?.detail?.albumId;
      // If no specific album in event, or it matches our current album
      if (!eventAlbumId || eventAlbumId === selectedAlbumId) {
        console.log(`Sticker data changed for album ${eventAlbumId || 'unknown'}, refreshing`);
        
        // Direct fetch on sticker data change
        if (selectedAlbumId) {
          const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
          console.log(`Refreshed ${fetchedStickers.length} stickers after sticker data changed`);
          setDirectStickers(fetchedStickers);
          
          // If we have stickers but props is empty, set the local fetch flag
          if (fetchedStickers.length > 0 && stickers.length === 0) {
            setLocalDirectFetch(true);
          }
        }
        
        onRefresh();
      }
    };
    
    const handleAlbumDataChanged = () => {
      console.log("Album data changed, refreshing stickers");
      onRefresh();
      
      // Also check for direct stickers since album data change might affect stickers
      if (selectedAlbumId) {
        const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
        setDirectStickers(fetchedStickers);
      }
    };
    
    // Add event listeners
    window.addEventListener('forceRefresh', handleForceRefresh);
    window.addEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
    window.addEventListener('albumDataChanged', handleAlbumDataChanged);
    
    // Trigger an initial check
    if (selectedAlbumId && stickers.length === 0) {
      const fetchedStickers = getStickersByAlbumId(selectedAlbumId);
      
      if (fetchedStickers.length > 0) {
        console.log(`Initial check found ${fetchedStickers.length} stickers, setting direct stickers`);
        setDirectStickers(fetchedStickers);
        setLocalDirectFetch(true);
        onRefresh();
      }
    }
    
    return () => {
      window.removeEventListener('forceRefresh', handleForceRefresh);
      window.removeEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
      window.removeEventListener('albumDataChanged', handleAlbumDataChanged);
    };
  }, [onRefresh, selectedAlbumId, stickers.length]);

  const filteredStickers = useMemo(() => {
    // Decide whether to use direct stickers or props stickers
    const sourceStickers = (stickers.length === 0 && directStickers.length > 0) 
                           ? directStickers 
                           : stickers;
    
    if (sourceStickers.length === 0) {
      console.log("No stickers available to filter");
      return [];
    }
    
    console.log(`Filtering ${sourceStickers.length} stickers by ${activeTab === "number" ? "number range" : "team"}`);
    
    let filtered = sourceStickers;
    
    // Apply number range filter
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } 
    // Apply team filter
    else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    console.log(`Filtered to ${filtered.length} stickers`);
    return filtered;
  }, [stickers, directStickers, activeTab, selectedRange, selectedTeam]);

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
