
import { Sticker } from "@/lib/types";

/**
 * Utility function for sorting stickers with improved logic:
 * - numeric stickers first, then alphanumeric
 * - alphanumeric stickers sorted by letter prefix then number
 */
export const useStickerSort = (stickers: Sticker[]): Sticker[] => {
  return [...stickers].sort((a, b) => {
    // First check if one is alphanumeric and one is numeric
    const aIsAlpha = typeof a.number === 'string' && /^[A-Za-z]/.test(String(a.number));
    const bIsAlpha = typeof b.number === 'string' && /^[A-Za-z]/.test(String(b.number));
    
    // Numeric stickers come before alphanumeric ones
    if (aIsAlpha && !bIsAlpha) return 1;
    if (!aIsAlpha && bIsAlpha) return -1;
    
    // If both are alphanumeric, sort by the letter prefix then the number
    if (aIsAlpha && bIsAlpha) {
      const aMatch = String(a.number).match(/^([A-Za-z]+)(\d+)$/);
      const bMatch = String(b.number).match(/^([A-Za-z]+)(\d+)$/);
      
      if (aMatch && bMatch) {
        // If letters are different, sort by letters
        if (aMatch[1] !== bMatch[1]) {
          return aMatch[1].localeCompare(bMatch[1]);
        }
        
        // If letters are same, sort by numbers
        const aNum = parseInt(aMatch[2], 10);
        const bNum = parseInt(bMatch[2], 10);
        return aNum - bNum;
      }
      
      // Fallback to string comparison
      return String(a.number).localeCompare(String(b.number));
    }
    
    // If both are numeric, simple numeric comparison
    const numA = typeof a.number === 'string' ? parseInt(a.number.replace(/\D/g, ''), 10) || 0 : a.number;
    const numB = typeof b.number === 'string' ? parseInt(b.number.replace(/\D/g, ''), 10) || 0 : b.number;
    return numA - numB;
  });
};
