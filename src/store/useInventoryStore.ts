
import { create } from 'zustand';
import { exchangeOffers } from '@/lib/data';
import { 
  getStickersByAlbumId,
  addStickersToInventory,
  getStickerTransactions
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
    set({ transactionMap: getStickerTransactions() });
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
