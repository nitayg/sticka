
import { getStickerData } from './basic-operations';

// Get collection statistics
export const getStats = (albumId?: string) => {
  const stickers = getStickerData();
  const filteredStickers = albumId 
    ? stickers.filter(sticker => sticker.albumId === albumId)
    : stickers;
  
  const owned = filteredStickers.filter(sticker => sticker.isOwned).length;
  const duplicates = filteredStickers.reduce(
    (count, sticker) => count + (sticker.isOwned && sticker.isDuplicate ? (sticker.duplicateCount || 0) : 0),
    0
  );
  
  return {
    total: filteredStickers.length,
    owned,
    duplicates
  };
};
