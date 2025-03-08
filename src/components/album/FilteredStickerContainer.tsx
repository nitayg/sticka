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
  
  useEffect(() => {
    if (selectedAlbumId && stickers.length === 0) {
      console.log("No stickers found for album", selectedAlbumId, "trying to fetch them directly");
      const directStickers = getStickersByAlbumId(selectedAlbumId);
      
      if (directStickers.length > 0 && stickers.length === 0) {
        console.log("Found stickers directly but they're not in state, triggering refresh");
        onRefresh();
      }
    }
  }, [selectedAlbumId, stickers.length, onRefresh]);

  const filteredStickers = useMemo(() => {
    if (stickers.length === 0 && selectedAlbumId) {
      const directStickers = getStickersByAlbumId(selectedAlbumId);
      console.log("Direct stickers fetch returned", directStickers.length, "stickers");
      
      if (directStickers.length > 0) {
        let filtered = directStickers;
        
        if (activeTab === "number" && selectedRange) {
          const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
          filtered = filtered.filter(sticker => 
            sticker.number >= rangeStart && sticker.number <= rangeEnd
          );
        } else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
          filtered = filtered.filter(sticker => sticker.team === selectedTeam);
        }
        
        return filtered;
      }
    }
    
    let filtered = stickers;
    
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
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
