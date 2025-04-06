
import { useMemo } from "react";
import { Sticker } from "@/lib/types";
import { useStickerSort } from "./album/useStickerSort";

/**
 * Hook to filter and sort stickers based on active filters
 */
export const useStickerFilters = (
  stickers: Sticker[],
  directStickers: Sticker[],
  localDirectFetch: boolean,
  activeTab: "number" | "team" | "manage",
  selectedRange: string | null,
  selectedTeam: string | null
) => {
  // Decide which stickers to use and apply filters
  return useMemo(() => {
    // If we should use direct stickers (when props are empty but direct fetch found stickers)
    const sourceStickers = (localDirectFetch && directStickers.length > 0) 
                          ? directStickers
                          : stickers;
    
    if (sourceStickers.length === 0) {
      return [];
    }
    
    // Apply filters based on the active tab
    let filtered = sourceStickers;
    
    // Filter by number range
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => {
        // Handle both string and number sticker numbers
        const stickerNum = typeof sticker.number === 'string' 
          ? parseInt(sticker.number.replace(/\D/g, ''), 10) || 0 
          : sticker.number;
        return stickerNum >= rangeStart && stickerNum <= rangeEnd;
      });
    } 
    // Filter by team
    else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    // Sort stickers
    return useStickerSort(filtered);
  }, [stickers, directStickers, localDirectFetch, activeTab, selectedRange, selectedTeam]);
};
