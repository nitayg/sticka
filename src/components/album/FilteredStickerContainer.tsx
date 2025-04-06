
import { Sticker } from "@/lib/types";
import StickerCollection from "../StickerCollection";
import { useDirectStickers } from "@/hooks/useDirectStickers";
import { useStickerEvents } from "@/hooks/useStickerEvents";
import { useStickerFilters } from "@/hooks/useStickerFilters";

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
  // Use custom hooks for various functionalities
  const { 
    localDirectFetch, 
    directStickers, 
    setDirectStickers, 
    setLocalDirectFetch 
  } = useDirectStickers(selectedAlbumId, stickers, onRefresh);
  
  // Setup event listeners for sticker data changes
  useStickerEvents(
    selectedAlbumId, 
    onRefresh, 
    stickers.length, 
    setDirectStickers, 
    setLocalDirectFetch
  );
  
  // Filter stickers based on active filters
  const filteredStickers = useStickerFilters(
    stickers,
    directStickers,
    localDirectFetch,
    activeTab,
    selectedRange,
    selectedTeam
  );

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
