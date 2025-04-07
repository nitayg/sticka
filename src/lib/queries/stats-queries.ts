
import { fetchStickersByAlbumId } from "./sticker-queries";

// Function to create a stats object for the album
export const fetchAlbumStats = async (albumId: string): Promise<{
  total: number;
  owned: number;
  needed: number;
  duplicates: number;
  percentage: number;
}> => {
  try {
    const stickers = await fetchStickersByAlbumId(albumId);
    
    const total = stickers.length;
    const owned = stickers.filter(s => s.isOwned).length;
    const needed = total - owned;
    const duplicates = stickers.filter(s => s.isDuplicate).length;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    
    return { total, owned, needed, duplicates, percentage };
  } catch (error) {
    console.error(`Error calculating album stats for ${albumId}:`, error);
    return { total: 0, owned: 0, needed: 0, duplicates: 0, percentage: 0 };
  }
};
