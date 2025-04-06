
import { useQuery } from "@tanstack/react-query";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { useStickerSort } from "./useStickerSort";

/**
 * Custom hook for fetching and sorting stickers for a selected album
 */
export const useStickerFetch = (selectedAlbumId: string, refreshKey: number) => {
  // Fetch stickers for the selected album - with explicit logging
  const { data: stickers = [], isLoading: isStickersLoading } = useQuery({
    queryKey: ['stickers', selectedAlbumId, refreshKey],
    queryFn: () => {
      if (!selectedAlbumId) return [];
      
      console.log(`Fetching stickers for album ${selectedAlbumId} from hook`);
      const albumStickers = getStickersByAlbumId(selectedAlbumId);
      console.log(`Hook found ${albumStickers.length} stickers for album ${selectedAlbumId}`);
      
      // Sort stickers using helper function
      return useStickerSort(albumStickers);
    },
    enabled: !!selectedAlbumId
  });

  return {
    stickers,
    isStickersLoading
  };
};
