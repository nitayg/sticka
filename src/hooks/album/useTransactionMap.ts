
import { useMemo } from "react";
import { Sticker, ExchangeOffer } from "@/lib/types";

/**
 * Custom hook to generate a transaction map from exchange offers
 */
export const useTransactionMap = (
  selectedAlbumId: string,
  stickers: Sticker[],
  exchangeOffers: ExchangeOffer[],
  refreshKey: number
) => {
  // Create transaction map from exchange offers
  return useMemo(() => {
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
        if (isNaN(Number(number))) return;
        
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
};
