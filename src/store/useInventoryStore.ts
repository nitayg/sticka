
import { create } from 'zustand';
import { exchangeOffers } from '@/lib/data';
import { 
  getStickersByAlbumId,
  addStickersToInventory,
} from '@/lib/sticker-operations';

type InventoryTab = "all" | "owned" | "needed" | "duplicates";
type ViewMode = "grid" | "list" | "compact";

interface InventoryState {
  // UI state
  activeTab: InventoryTab;
  viewMode: ViewMode;
  showImages: boolean;
  isIntakeFormOpen: boolean;
  
  // Data state
  selectedAlbumId: string;
  refreshKey: number;
  transactionMap: Record<string, { person: string, color: string }>;
  
  // Actions
  setActiveTab: (tab: InventoryTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setShowImages: (show: boolean) => void;
  setIsIntakeFormOpen: (isOpen: boolean) => void;
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

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // UI state
  activeTab: "all" as InventoryTab,
  viewMode: "compact" as ViewMode,
  showImages: true,
  isIntakeFormOpen: false,
  
  // Data state
  selectedAlbumId: "",
  refreshKey: 0,
  transactionMap: {},
  
  // Actions
  setActiveTab: (activeTab) => set({ activeTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowImages: (showImages) => set({ showImages }),
  setIsIntakeFormOpen: (isIntakeFormOpen) => set({ isIntakeFormOpen }),
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
    
    // Notify other components about the change
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    
    // Convert the result to match the expected return type with arrays
    // Now handling as a resolved Promise, not a direct return
    return Promise.resolve({
      newlyOwned: result.newlyOwned > 0 ? stickerNumbers.slice(0, result.newlyOwned) : [],
      duplicatesUpdated: result.duplicatesUpdated > 0 ? stickerNumbers.slice(result.newlyOwned, result.newlyOwned + result.duplicatesUpdated) : [],
      notFound: result.notFound > 0 ? stickerNumbers.slice(result.newlyOwned + result.duplicatesUpdated, result.newlyOwned + result.duplicatesUpdated + result.notFound) : []
    });
  }
}));
