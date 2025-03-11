
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchAllAlbums } from "@/lib/queries";
import { getStickersByAlbumId, getStickerData } from "@/lib/sticker-operations";
import { exchangeOffers } from "@/lib/data";
import { Sticker } from "@/lib/types";

interface UseAlbumDataProps {
  selectedAlbumId: string;
  refreshKey: number;
  activeTab: "number" | "team" | "manage";
  showAllAlbumStickers: boolean;
}

export const useAlbumData = ({ 
  selectedAlbumId, 
  refreshKey, 
  activeTab,
  showAllAlbumStickers
}: UseAlbumDataProps) => {
  // Fetch albums
  const { data: albums = [], isLoading: isAlbumsLoading } = useQuery({
    queryKey: ['albums', refreshKey],
    queryFn: fetchAllAlbums
  });
  
  // Fetch stickers for the selected album - with explicit logging
  const { data: stickers = [], isLoading: isStickersLoading } = useQuery({
    queryKey: ['stickers', selectedAlbumId, refreshKey],
    queryFn: () => {
      if (!selectedAlbumId) return [];
      
      console.log(`Fetching stickers for album ${selectedAlbumId} from hook`);
      const albumStickers = getStickersByAlbumId(selectedAlbumId);
      console.log(`Hook found ${albumStickers.length} stickers for album ${selectedAlbumId}`);
      
      // Sort stickers by number before returning
      return [...albumStickers].sort((a, b) => a.number - b.number);
    },
    enabled: !!selectedAlbumId
  });

  // Is loading any data
  const isLoading = isAlbumsLoading || (selectedAlbumId && isStickersLoading);

  // Create transaction map from exchange offers
  const transactionMap = useMemo(() => {
    if (!selectedAlbumId) return {};
    
    const map: Record<string, { person: string, color: string }> = {};
    
    // Get relevant exchanges for this album
    const relevantExchanges = exchangeOffers.filter(
      exchange => exchange.albumId === selectedAlbumId
    );
    
    // Map stickers to their transactions
    relevantExchanges.forEach(exchange => {
      // Find stickers that the user will receive
      const stickerNumbers = exchange.wantedStickerId.map(id => parseInt(id));
      
      stickerNumbers.forEach(number => {
        const sticker = stickers.find(s => s.number === number);
        if (sticker) {
          map[sticker.id] = {
            person: exchange.userName,
            color: exchange.color || "bg-secondary"
          };
        }
      });
    });
    
    return map;
  }, [selectedAlbumId, stickers, refreshKey]);

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
      const hundred = Math.floor(sticker.number / 100) * 100;
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
    albums,
    stickers,
    transactionMap,
    teams,
    numberRanges,
    teamLogos,
    isLoading
  };
};
