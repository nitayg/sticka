
import { useEffect, useMemo } from "react";
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
  
  // Fetch stickers if not provided in props
  useEffect(() => {
    if (selectedAlbumId && stickers.length === 0) {
      console.log("No stickers found in props for album", selectedAlbumId, "trying to fetch them directly");
      const directStickers = getStickersByAlbumId(selectedAlbumId);
      
      if (directStickers.length > 0 && stickers.length === 0) {
        console.log(`Found ${directStickers.length} stickers directly for album ${selectedAlbumId}, triggering refresh`);
        onRefresh();
      }
    }
  }, [selectedAlbumId, stickers.length, onRefresh]);

  // Listen for forced refresh events
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log("Force refresh triggered in FilteredStickerContainer");
      onRefresh();
    };
    
    const handleStickerDataChanged = (e: CustomEvent) => {
      const albumId = e.detail?.albumId;
      if (!albumId || albumId === selectedAlbumId) {
        console.log(`Sticker data changed for album ${albumId || 'unknown'}, refreshing`);
        onRefresh();
      }
    };
    
    window.addEventListener('forceRefresh', handleForceRefresh);
    window.addEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
    window.addEventListener('albumDataChanged', handleForceRefresh);
    
    return () => {
      window.removeEventListener('forceRefresh', handleForceRefresh);
      window.removeEventListener('stickerDataChanged', handleStickerDataChanged as EventListener);
      window.removeEventListener('albumDataChanged', handleForceRefresh);
    };
  }, [onRefresh, selectedAlbumId]);

  const filteredStickers = useMemo(() => {
    // If no stickers in props, try to get them directly
    if (stickers.length === 0 && selectedAlbumId) {
      const directStickers = getStickersByAlbumId(selectedAlbumId);
      console.log("Direct stickers fetch returned", directStickers.length, "stickers for album", selectedAlbumId);
      
      if (directStickers.length > 0) {
        let filtered = directStickers;
        
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
        
        return filtered;
      }
    }
    
    // Use stickers from props
    let filtered = stickers;
    
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
    
    return filtered;
  }, [stickers, activeTab, selectedRange, selectedTeam, selectedAlbumId]);

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
