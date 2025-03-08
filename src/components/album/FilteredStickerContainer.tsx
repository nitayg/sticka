
import { useMemo } from "react";
import { Sticker } from "@/lib/types";
import StickerCollection from "../StickerCollection";

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
    // We'll use the stickers prop that's passed in
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
  }, [stickers, activeTab, selectedRange, selectedTeam]);

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
