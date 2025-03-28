
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

export const useInventoryDataStore = create<InventoryDataState>((set, get) => {
  // Track if an update is already in progress to prevent infinite loops
  let isUpdatingTransactionMap = false;

  return {
    // Data state
    selectedAlbumId: "",
    refreshKey: 0,
    transactionMap: {},
    
    // Actions
    setSelectedAlbumId: (selectedAlbumId) => {
      // Skip update if already selected to prevent unnecessary re-renders
      if (get().selectedAlbumId === selectedAlbumId) return;
      set({ selectedAlbumId });
    },
    
    handleRefresh: () => {
      // Increment the refresh key to trigger a refresh
      set((state) => ({ refreshKey: state.refreshKey + 1 }));
      
      // Use delayed transaction map update to avoid React maximum update depth error
      const { selectedAlbumId } = get();
      if (selectedAlbumId && !isUpdatingTransactionMap) {
        // Add timeout to break potential update cycles
        setTimeout(() => {
          get().updateTransactionMap(selectedAlbumId);
        }, 50);
      }
    },
    
    handleAlbumChange: (albumId) => {
      // Skip update if already selected
      if (get().selectedAlbumId === albumId) return;
      
      set({ selectedAlbumId: albumId });
      
      // Use a timeout to prevent update cycles when switching albums
      // This breaks the potential infinite loop
      if (!isUpdatingTransactionMap) {
        setTimeout(() => {
          if (get().selectedAlbumId === albumId) { // Only update if still the selected album
            get().updateTransactionMap(albumId);
          }
        }, 50);
      }
    },
    
    updateTransactionMap: async (albumId) => {
      if (!albumId || isUpdatingTransactionMap) return;
      
      isUpdatingTransactionMap = true;
      
      try {
        const newTransactionMap: Record<string, { person: string, color: string }> = {};
        
        // Get exchange offers from Supabase instead of local state
        const exchangeOffers = await fetchExchangeOffers() || [];
        
        // Get relevant exchanges for this album
        const relevantExchanges = exchangeOffers.filter(exchange => 
          exchange.albumId === albumId && !exchange.isDeleted
        );
        
        // Map stickers to their transactions
        relevantExchanges.forEach(exchange => {
          // Find stickers that the user will receive
          const stickerNumbers = Array.isArray(exchange.wantedStickerId) 
            ? exchange.wantedStickerId.map(id => parseInt(id)) 
            : [];
          
          // Get actual stickers
          const albumStickers = getStickersByAlbumId(albumId);
          
          stickerNumbers.forEach(number => {
            if (isNaN(number)) {
              return;
            }
            
            const sticker = albumStickers.find(s => s.number === number);
            if (sticker) {
              newTransactionMap[sticker.id] = {
                person: exchange.userName,
                color: exchange.color || "bg-secondary"
              };
            }
          });
        });
        
        // Only update state if the component is still mounted and the album is still selected
        if (get().selectedAlbumId === albumId) {
          set({ transactionMap: newTransactionMap });
        }
      } catch (error) {
        console.error('Error updating transaction map:', error);
      } finally {
        isUpdatingTransactionMap = false;
      }
    },
    
    handleStickerIntake: (albumId, stickerNumbers) => {
      const result = addStickersToInventory(albumId, stickerNumbers);
      
      // Schedule a refresh after the current execution completes
      // Use a timeout to prevent update cycles
      const handleRefresh = get().handleRefresh;
      setTimeout(() => {
        handleRefresh();
      }, 50);
      
      // Get stickers for logging
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
      
      // Notify other components about the change - but don't trigger multiple updates
      // Use a custom event to notify other components
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
        window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      }, 100);
      
      // Return the information about which stickers were processed
      return {
        newlyOwned: result.newlyOwned,
        duplicatesUpdated: result.duplicatesUpdated,
        notFound: result.notFound
      };
    }
  };
});
