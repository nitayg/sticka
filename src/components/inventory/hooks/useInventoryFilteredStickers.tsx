
import { useQuery } from "@tanstack/react-query";
import { fetchStickersByAlbumId } from "@/lib/queries";
import { useMemo } from "react";

interface UseInventoryFilteredStickersProps {
  selectedAlbumId: string;
  activeTab: "all" | "owned" | "needed" | "duplicates";
}

/**
 * Custom hook to handle filtering stickers based on the selected tab
 */
export const useInventoryFilteredStickers = ({
  selectedAlbumId,
  activeTab
}: UseInventoryFilteredStickersProps) => {
  // Fetch stickers for the selected album
  const { data: albumStickers = [], isLoading: isStickersLoading } = useQuery({
    queryKey: ['stickers', selectedAlbumId],
    queryFn: () => fetchStickersByAlbumId(selectedAlbumId),
    enabled: !!selectedAlbumId,
  });
  
  // Filter stickers based on the active tab
  const filteredStickers = useMemo(() => {
    return albumStickers.filter(sticker => {
      if (activeTab === "all") return true;
      if (activeTab === "owned") return sticker.isOwned;
      if (activeTab === "needed") return !sticker.isOwned;
      if (activeTab === "duplicates") return sticker.isDuplicate && sticker.isOwned;
      return true;
    });
  }, [albumStickers, activeTab]);
  
  // Calculate tab statistics
  const tabStats = useMemo(() => ({
    all: albumStickers.length,
    owned: albumStickers.filter(s => s.isOwned).length,
    needed: albumStickers.filter(s => !s.isOwned).length,
    duplicates: albumStickers.filter(s => s.isDuplicate && s.isOwned).length
  }), [albumStickers]);
  
  return {
    albumStickers,
    isStickersLoading,
    filteredStickers,
    tabStats
  };
};
