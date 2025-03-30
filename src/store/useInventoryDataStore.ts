
import { create } from 'zustand';
import { fetchExchangeOffers } from '@/lib/supabase';
import { getStickersByAlbumId, addStickersToInventory } from '@/lib/sticker-operations';
import { useIntakeLogStore } from './useIntakeLogStore';
import { getAlbumById } from '@/lib/data';

interface InventoryDataState {
  // Data state
  selectedAlbumId: string;
  refreshKey: number;
  transactionMap: Record<string, { person: string, color: string }>;
  cachedStickers: Record<string, any[]>; // Cache stickers by albumId to reduce egress
  lastRefreshTimestamp: number; // Track last refresh time for throttling
  
  // Actions
  setSelectedAlbumId: (albumId: string) => void;
  handleRefresh: () => void;
  handleAlbumChange: (albumId: string) => void;
  handleStickerIntake: (albumId: string, stickerNumbers: (number | string)[]) => {
    newlyOwned: (number | string)[];
    duplicatesUpdated: (number | string)[];
    notFound: (number | string)[];
  };
  updateTransactionMap: (albumId: string) => void;
}

export const useInventoryDataStore = create<InventoryDataState>((set, get) => ({
  // Data state
  selectedAlbumId: "",
  refreshKey: 0,
  transactionMap: {},
  cachedStickers: {},
  lastRefreshTimestamp: 0,
  
  // Actions
  setSelectedAlbumId: (selectedAlbumId) => {
    set({ selectedAlbumId });
    get().updateTransactionMap(selectedAlbumId);
  },
  
  handleRefresh: () => {
    const now = Date.now();
    const { lastRefreshTimestamp } = get();
    
    // Throttle refreshes to at most once every 1000ms to reduce egress
    if (now - lastRefreshTimestamp < 1000) {
      console.log('Refresh throttled to reduce egress traffic');
      return;
    }
    
    set((state) => ({ 
      refreshKey: state.refreshKey + 1,
      lastRefreshTimestamp: now
    }));
    
    const { selectedAlbumId } = get();
    if (selectedAlbumId) {
      // Clear cached data for this album to ensure fresh data
      set(state => ({
        cachedStickers: {
          ...state.cachedStickers,
          [selectedAlbumId]: undefined
        }
      }));
      
      get().updateTransactionMap(selectedAlbumId);
    }
  },
  
  handleAlbumChange: (albumId) => {
    set({ selectedAlbumId: albumId });
    get().updateTransactionMap(albumId);
  },
  
  updateTransactionMap: async (albumId) => {
    if (!albumId) return;
    
    const newTransactionMap: Record<string, { person: string, color: string }> = {};
    
    try {
      // Get exchange offers from Supabase - limit query to reduce egress
      const exchangeOffers = await fetchExchangeOffers() || [];
      console.log('Retrieved exchange offers for transaction map:', exchangeOffers);
      
      // Get relevant exchanges for this album
      const relevantExchanges = exchangeOffers.filter(exchange => 
        exchange.albumId === albumId && !exchange.isDeleted
      );
      
      console.log(`Found ${relevantExchanges.length} relevant exchanges for album ${albumId}`);
      
      // Only fetch stickers once - caching to reduce egress
      const albumStickers = getStickersByAlbumId(albumId);
      
      // Map stickers to their transactions
      relevantExchanges.forEach(exchange => {
        // Find stickers that the user will receive
        const stickerNumbers = Array.isArray(exchange.wantedStickerId) 
          ? exchange.wantedStickerId.map(id => {
              return typeof id === 'string' ? 
                (/^\d+$/.test(id) ? parseInt(id) : id) : id;
            })
          : [];
        
        stickerNumbers.forEach(number => {
          if (typeof number === 'number' && isNaN(number)) {
            console.warn(`Invalid sticker number in exchange ${exchange.id}:`, number);
            return;
          }
          
          const sticker = albumStickers.find(s => s.number === number);
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
      
      console.log('Updated transaction map:', newTransactionMap);
      set({ transactionMap: newTransactionMap });
    } catch (error) {
      console.error('Error updating transaction map:', error);
    }
  },
  
  handleStickerIntake: (albumId, stickerNumbers) => {
    const result = addStickersToInventory(albumId, stickerNumbers);
    get().handleRefresh();
    
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
    
    // Notify other components about the change
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    
    // Return the information about which stickers were processed
    return {
      newlyOwned: result.newlyOwned,
      duplicatesUpdated: result.duplicatesUpdated,
      notFound: result.notFound
    };
  }
}));
