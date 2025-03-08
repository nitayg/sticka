
import { create } from 'zustand';
import { exchangeOffers } from '@/lib/initial-data';
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
  handleStickerIntake: (albumId: string, stickerNumbers: number[]) => Promise<{
    newlyOwned: number[];
    duplicatesUpdated: number[];
    notFound: number[];
  }>;
  updateTransactionMap: (albumId: string) => void;
}

export const useInventoryDataStore = create<InventoryDataState>((set, get) => ({
  // Data state
  selectedAlbumId: "",
  refreshKey: 0,
  transactionMap: {},
  
  // Actions
  setSelectedAlbumId: (selectedAlbumId) => {
    set({ selectedAlbumId });
    get().updateTransactionMap(selectedAlbumId);
  },
  
  handleRefresh: () => {
    set((state) => ({ refreshKey: state.refreshKey + 1 }));
    const { selectedAlbumId } = get();
    if (selectedAlbumId) {
      get().updateTransactionMap(selectedAlbumId);
    }
  },
  
  handleAlbumChange: (albumId) => {
    set({ selectedAlbumId: albumId });
    get().updateTransactionMap(albumId);
  },
  
  updateTransactionMap: (albumId) => {
    if (!albumId) return;
    
    const newTransactionMap: Record<string, { person: string, color: string }> = {};
    
    // Get relevant exchanges for this album
    const relevantExchanges = exchangeOffers.filter(exchange => exchange.albumId === albumId);
    
    // Map stickers to their transactions
    relevantExchanges.forEach(exchange => {
      // Find stickers that the user will receive
      const stickerNumbers = exchange.wantedStickerId.map(id => parseInt(id));
      
      // Get actual stickers
      const albumStickers = getStickersByAlbumId(albumId);
      
      stickerNumbers.forEach(number => {
        const sticker = albumStickers.find(s => s.number === number);
        if (sticker) {
          newTransactionMap[sticker.id] = {
            person: exchange.userName,
            color: exchange.color || "bg-secondary"
          };
        }
      });
    });
    
    set({ transactionMap: newTransactionMap });
  },
  
  handleStickerIntake: async (albumId, stickerNumbers) => {
    const result = addStickersToInventory(albumId, stickerNumbers);
    get().handleRefresh();
    
    // Get stickers for logging
    const albumStickers = getStickersByAlbumId(albumId);
    
    // Update the most recent log entry with the real results
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
    return Promise.resolve({
      newlyOwned: result.newlyOwned,
      duplicatesUpdated: result.duplicatesUpdated,
      notFound: result.notFound
    });
  }
}));
