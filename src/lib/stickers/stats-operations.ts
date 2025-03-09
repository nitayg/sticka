
import { getStickerData } from './basic-operations';

// Get album statistics
export const getStats = () => {
  const stickers = getStickerData();
  
  const totalStickers = stickers.length;
  const ownedStickers = stickers.filter(s => s.isOwned).length;
  const duplicateStickers = stickers.filter(s => s.isDuplicate).length;
  const neededStickers = totalStickers - ownedStickers;
  const completionPercentage = totalStickers > 0 
    ? Math.round((ownedStickers / totalStickers) * 100) 
    : 0;
  
  // Return in both formats for compatibility
  return {
    // New format
    totalStickers,
    ownedStickers,
    duplicateStickers,
    neededStickers,
    completionPercentage,
    // Old format for backward compatibility
    total: totalStickers,
    owned: ownedStickers,
    needed: neededStickers,
    duplicates: duplicateStickers
  };
};
