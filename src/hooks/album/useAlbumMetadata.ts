
import { useMemo } from "react";
import { Sticker } from "@/lib/types";
import { getStickerData } from "@/lib/sticker-operations";

interface AlbumMetadataProps {
  stickers: Sticker[];
  activeTab: "number" | "team" | "manage";
  showAllAlbumStickers: boolean;
}

/**
 * Custom hook to extract team information, number ranges and team logos
 */
export const useAlbumMetadata = ({
  stickers,
  activeTab,
  showAllAlbumStickers
}: AlbumMetadataProps) => {
  // Generate team list from stickers
  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    const stickersToCheck = activeTab === "manage" || showAllAlbumStickers
      ? getStickerData()
      : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team) {
        teamSet.add(sticker.team);
      }
    });
    
    // Sort by sticker order, not alphabetically
    if (stickers.length > 0) {
      const teamOrder: Record<string, number> = {};
      stickers.forEach((sticker, index) => {
        if (sticker.team && !(sticker.team in teamOrder)) {
          teamOrder[sticker.team] = index;
        }
      });
      
      return Array.from(teamSet).sort((a, b) => {
        return (teamOrder[a] || 9999) - (teamOrder[b] || 9999);
      });
    }
    
    return Array.from(teamSet);
  }, [stickers, activeTab, showAllAlbumStickers]);

  // Generate number ranges from stickers
  const numberRanges = useMemo(() => {
    if (!stickers.length) return [];
    
    const ranges = new Set<string>();
    stickers.forEach(sticker => {
      // Convert string numbers to numeric for range calculation
      const numericValue = typeof sticker.number === 'string' 
        ? parseInt(sticker.number.replace(/\D/g, ''), 10) || 0
        : sticker.number;
        
      const hundred = Math.floor(numericValue / 100) * 100;
      const rangeEnd = hundred + 99;
      ranges.add(`${hundred}-${rangeEnd}`);
    });
    
    return Array.from(ranges).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });
  }, [stickers]);
  
  // Map team logos to teams
  const teamLogos = useMemo(() => {
    const logoMap: Record<string, string> = {};
    const stickersToCheck = activeTab === "manage" || showAllAlbumStickers
      ? getStickerData()
      : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team && sticker.teamLogo) {
        logoMap[sticker.team] = sticker.teamLogo;
      }
    });
    return logoMap;
  }, [stickers, activeTab, showAllAlbumStickers]);

  return {
    teams,
    numberRanges,
    teamLogos
  };
};
