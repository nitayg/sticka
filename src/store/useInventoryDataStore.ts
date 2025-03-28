
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
  // Important flag to prevent infinite loops during updates
  let isUpdatingTransactionMap = false;
  let albumUpdateInProgress = false;

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
      
      // Use delayed transaction map update with increased timeout
      const { selectedAlbumId } = get();
      if (selectedAlbumId && !isUpdatingTransactionMap) {
        // Add longer timeout to break potential update cycles
        setTimeout(() => {
          get().updateTransactionMap(selectedAlbumId);
        }, 300); // Increased timeout
      }
    },
    
    handleAlbumChange: (albumId) => {
      // Skip update if already selected or in progress
      if (get().selectedAlbumId === albumId || albumUpdateInProgress) return;
      
      // Set flag to prevent concurrent updates
      albumUpdateInProgress = true;
      
      set({ selectedAlbumId: albumId });
      
      // Use a timeout to prevent update cycles when switching albums
      if (!isUpdatingTransactionMap) {
        setTimeout(() => {
          if (get().selectedAlbumId === albumId) { // Only update if still the selected album
            get().updateTransactionMap(albumId);
          }
          // Reset flag after operation completes
          albumUpdateInProgress = false;
        }, 300); // Increased timeout
      } else {
        // Make sure to reset flag even if we don't update
        albumUpdateInProgress = false;
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
        // Always reset the flag when done
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
      }, 300); // Increased timeout
      
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
      
      // Use a custom event with longer timeout to notify other components
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
        window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      }, 300); // Increased timeout
      
      // Return the information about which stickers were processed
      return {
        newlyOwned: result.newlyOwned,
        duplicatesUpdated: result.duplicatesUpdated,
        notFound: result.notFound
      };
    }
  };
});
