import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchAllAlbums } from "@/lib/queries";
import { getStickersByAlbumId, getStickerData } from "@/lib/sticker-operations";
import { fetchExchangeOffers } from "@/lib/supabase";
import { Sticker, ExchangeOffer } from "@/lib/types";

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
      
      // Sort stickers with improved sorting logic: numeric first, then alphanumeric
      return [...albumStickers].sort((a, b) => {
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
    },
    enabled: !!selectedAlbumId
  });
  
  // Fetch exchange offers
  const { data: exchangeOffers = [], isLoading: isExchangesLoading } = useQuery({
    queryKey: ['exchangeOffers', refreshKey],
    queryFn: async () => {
      const offers = await fetchExchangeOffers() || [];
      return offers.filter(offer => !offer.isDeleted);
    }
  });

  // Is loading any data
  const isLoading = isAlbumsLoading || (selectedAlbumId && isStickersLoading) || isExchangesLoading;

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
      const stickerNumbers = Array.isArray(exchange.wantedStickerId)
        ? exchange.wantedStickerId.map(id => {
            // Handle both string and number types
            return typeof id === 'string' ? parseInt(id, 10) : id;
          })
        : [];
      
      stickerNumbers.forEach(number => {
        if (isNaN(number)) return;
        
        const sticker = stickers.find(s => {
          if (typeof s.number === 'string' && typeof number === 'number') {
            return parseInt(s.number.replace(/\D/g, ''), 10) === number;
          }
          return s.number === number;
        });
        
        if (sticker) {
          map[sticker.id] = {
            person: exchange.userName,
            color: exchange.color || "bg-secondary"
          };
        }
      });
    });
    
    return map;
  }, [selectedAlbumId, stickers, exchangeOffers, refreshKey]);

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
    albums,
    stickers,
    transactionMap,
    teams,
    numberRanges,
    teamLogos,
    isLoading
  };
};
