
import { useMemo } from "react";
import { Sticker } from "@/lib/types";
import StickerCollection from "../StickerCollection";
import { stickerData } from "@/lib/sticker-operations";

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
  const filteredStickers = useMemo(() => {
    let allStickers = (activeTab === "manage" && selectedTeam) || (showAllAlbumStickers && selectedTeam) 
      ? stickerData 
      : stickers;
    
    let filtered = allStickers;
    
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if (((activeTab === "team" || activeTab === "manage") && selectedTeam) || (showAllAlbumStickers && selectedTeam)) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    return filtered;
  }, [stickers, activeTab, selectedRange, selectedTeam, showAllAlbumStickers]);

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
