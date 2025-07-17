import { create } from 'zustand';
import { fetchExchangeOffers } from '@/lib/supabase';
import { getStickersByAlbumId, addStickersToInventory } from '@/lib/sticker-operations';
import { useIntakeLogStore } from './useIntakeLogStore';
import { getAlbumById } from '@/lib/album-operations';

// Define a type for the cached stickers
interface CachedStickersData {
  data: any[];
  timestamp: number;
}

interface InventoryDataState {
  // Data state
  selectedAlbumId: string;
  refreshKey: number;
  transactionMap: Record<string, { person: string, color: string }>;
  cachedStickers: Record<string, CachedStickersData | undefined>; 
  lastRefreshTimestamp: number; // Track last refresh time for throttling
  lastExchangeOffersRefresh: number; // Track exchange offers refresh time
  cachedExchangeOffers: any[] | null; // Cache exchange offers
  
  // Actions
  setSelectedAlbumId: (albumId: string) => void;
  handleRefresh: () => void;
  handleAlbumChange: (albumId: string) => void;
  handleStickerIntake: (albumId: string, stickerNumbers: (number | string)[]) => Promise<{
    newlyOwned: (number | string)[];
    duplicatesUpdated: (number | string)[];
    notFound: (number | string)[];
  }>;
  updateTransactionMap: (albumId: string) => void;
}

export const useInventoryDataStore = create<InventoryDataState>((set, get) => ({
  // Data state
  selectedAlbumId: "",
  refreshKey: 0,
  transactionMap: {},
  cachedStickers: {},
  lastRefreshTimestamp: 0,
  lastExchangeOffersRefresh: 0,
  cachedExchangeOffers: null,
  
  // Actions
  setSelectedAlbumId: (selectedAlbumId) => {
    set({ selectedAlbumId });
    get().updateTransactionMap(selectedAlbumId);
  },
  
  handleRefresh: () => {
    const now = Date.now();
    const { lastRefreshTimestamp } = get();
    
    // Reduce throttling time to 500ms for more responsive UI updates
    if (now - lastRefreshTimestamp < 500) {
      console.log('Refresh throttled to reduce egress traffic');
      return;
    }
    
    set((state) => ({ 
      refreshKey: state.refreshKey + 1,
      lastRefreshTimestamp: now
    }));
    
    const { selectedAlbumId } = get();
    if (selectedAlbumId) {
      // Clear cached data for this album only after 2 minutes to ensure fresh data without excessive requests
      const cachedData = get().cachedStickers[selectedAlbumId];
      const cacheAge = cachedData?.timestamp ? now - cachedData.timestamp : Infinity;
      
      // Only clear cache if it's older than 2 minutes
      if (!cachedData || cacheAge > 2 * 60 * 1000) {
        console.log(`Cache for album ${selectedAlbumId} is old or doesn't exist, refreshing`);
        set(state => ({
          cachedStickers: {
            ...state.cachedStickers,
            [selectedAlbumId]: undefined
          }
        }));
        
        get().updateTransactionMap(selectedAlbumId);
      } else {
        console.log(`Using cached data for album ${selectedAlbumId}, cache age: ${Math.round(cacheAge/1000)}s`);
      }
    }
  },
  
  handleAlbumChange: (albumId) => {
    set({ selectedAlbumId: albumId });
    get().updateTransactionMap(albumId);
  },
  
  updateTransactionMap: async (albumId) => {
    if (!albumId) return;
    
    const newTransactionMap: Record<string, { person: string, color: string }> = {};
    const now = Date.now();
    
    try {
      // Check if we have cached exchange offers and if they're still fresh (less than 5 minutes old)
      const { lastExchangeOffersRefresh, cachedExchangeOffers } = get();
      const shouldRefreshExchanges = !cachedExchangeOffers || (now - lastExchangeOffersRefresh > 5 * 60 * 1000);
      
      let exchangeOffers;
      if (shouldRefreshExchanges) {
        console.log('Fetching fresh exchange offers from Supabase');
        // Get exchange offers from Supabase - limit query to reduce egress
        exchangeOffers = await fetchExchangeOffers() || [];
        
        // Cache the exchange offers
        set({ 
          cachedExchangeOffers: exchangeOffers,
          lastExchangeOffersRefresh: now
        });
      } else {
        console.log('Using cached exchange offers, age:', Math.round((now - lastExchangeOffersRefresh)/1000), 'seconds');
        exchangeOffers = cachedExchangeOffers;
      }
      
      // Get relevant exchanges for this album
      const relevantExchanges = exchangeOffers.filter(exchange => 
        exchange.albumId === albumId && !exchange.isDeleted
      );
      
      console.log(`Found ${relevantExchanges.length} relevant exchanges for album ${albumId}`);
      
      // Only fetch stickers for this album - caching to reduce egress
      const { cachedStickers } = get();
      let albumStickers: any;
      
      if (cachedStickers[albumId]) {
        console.log(`Using cached stickers for album ${albumId}`);
        albumStickers = cachedStickers[albumId]?.data;
      } else {
        console.log(`Fetching stickers for album ${albumId}`);
        albumStickers = getStickersByAlbumId(albumId);
        
        // Cache the stickers with timestamp
        set(state => ({
          cachedStickers: {
            ...state.cachedStickers,
            [albumId]: {
              data: albumStickers,
              timestamp: now
            }
          }
        }));
      }
      
      // Map stickers to their transactions
      relevantExchanges.forEach(exchange => {
        // Find stickers that the user will receive
        const stickerNumbers = Array.isArray(exchange.wantedStickerId) 
          ? exchange.wantedStickerId.map((id: any) => {
              return typeof id === 'string' ? 
                (/^\d+$/.test(id) ? parseInt(id) : id) : id;
            })
          : [];
        
        stickerNumbers.forEach((number: any) => {
          if (typeof number === 'number' && isNaN(number)) {
            console.warn(`Invalid sticker number in exchange ${exchange.id}:`, number);
            return;
          }
          
          const sticker = albumStickers.find((s: any) => s.number === number);
          if (sticker) {
            newTransactionMap[sticker.id] = {
              person: exchange.userName,
              color: exchange.color || "bg-secondary"
            };
          } else {
            console.warn(`Sticker #${number} not found in album ${albumId}`);
          }
        });
      });
      
      console.log('Updated transaction map');
      set({ transactionMap: newTransactionMap });
    } catch (error) {
      console.error('Error updating transaction map:', error);
    }
  },
  
  handleStickerIntake: async (albumId, stickerNumbers) => {
    const result = addStickersToInventory(albumId, stickerNumbers);
    
    // Throttled refresh - reduced delay for quicker UI updates
    setTimeout(() => get().handleRefresh(), 100);
    
    // Get album for logging
    const album = getAlbumById(albumId);
    const { addLogEntry } = useIntakeLogStore.getState();
    const logEntries = useIntakeLogStore.getState().intakeLog;
    
    if (logEntries.length > 0) {
      // Remove the first entry (most recent)
      const [firstEntry, ...restEntries] = logEntries;
      
      // Create updated entry
      const updatedEntry = {
        ...firstEntry,
        newStickers: result.newlyOwned,
        newDuplicates: [],
        updatedDuplicates: result.duplicatesUpdated
      };
      
      // Clear and then restore the log with the updated entry
      useIntakeLogStore.setState({ intakeLog: [updatedEntry, ...restEntries] });
    } else {
      // If no existing entry, create a new one
      addLogEntry({
        albumId,
        albumName: album?.name || "אלבום לא ידוע",
        source: "קליטה ישירה",
        newStickers: result.newlyOwned,
        newDuplicates: [],
        updatedDuplicates: result.duplicatesUpdated,
      });
    }
    
    // Dispatch events immediately for faster UI updates
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Return the information about which stickers were processed
    return {
      newlyOwned: result.newlyOwned,
      duplicatesUpdated: result.duplicatesUpdated,
      notFound: result.notFound
    };
  }
}));
