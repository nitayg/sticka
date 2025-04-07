
import { create } from 'zustand';

type ViewMode = "grid" | "list" | "compact";

interface AlbumState {
  // UI state
  viewMode: ViewMode;
  showImages: boolean;
  
  // Filter state
  selectedAlbumId: string;
  
  // Data refresh
  refreshKey: number;
  lastRefreshTime: number;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setShowImages: (show: boolean) => void;
  setSelectedAlbumId: (albumId: string) => void;
  
  handleRefresh: () => void;
  handleAlbumChange: (albumId: string) => void;
}

export const useAlbumStore = create<AlbumState>((set, get) => ({
  // UI state
  viewMode: "compact",
  showImages: true,
  
  // Filter state
  selectedAlbumId: "",
  
  // Data refresh
  refreshKey: 0,
  lastRefreshTime: 0,
  
  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setShowImages: (showImages) => set({ showImages }),
  setSelectedAlbumId: (selectedAlbumId) => set({ selectedAlbumId }),
  
  handleRefresh: () => {
    const now = Date.now();
    const lastRefreshTime = get().lastRefreshTime;
    
    // Prevent refreshing too frequently (more than once per second)
    if (now - lastRefreshTime < 1000) {
      console.log("[AlbumStore] Refresh throttled to prevent excess requests");
      return;
    }
    
    set((state) => ({ 
      refreshKey: state.refreshKey + 1,
      lastRefreshTime: now
    }));
    
    console.log("[AlbumStore] Refresh triggered, new key:", get().refreshKey);
  },
  
  handleAlbumChange: (albumId) => {
    set({
      selectedAlbumId: albumId
    });
    
    const event = new CustomEvent('albumChanged', { detail: { albumId } });
    window.dispatchEvent(event);
    
    console.log("[AlbumStore] Album changed to:", albumId);
  }
}));
