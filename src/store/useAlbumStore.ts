
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
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setShowImages: (show: boolean) => void;
  setSelectedAlbumId: (albumId: string) => void;
  
  handleRefresh: () => void;
  handleAlbumChange: (albumId: string) => void;
}

// זיהוי אם המכשיר הוא אייפון
const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
// ברירת מחדל ל-compact באייפון, ובמחשב grid
const defaultViewMode: ViewMode = isIOS ? 'compact' : 'grid';

export const useAlbumStore = create<AlbumState>((set) => ({
  // UI state
  viewMode: defaultViewMode,
  showImages: true,
  
  // Filter state
  selectedAlbumId: "",
  
  // Data refresh
  refreshKey: 0,
  
  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setShowImages: (showImages) => set({ showImages }),
  setSelectedAlbumId: (selectedAlbumId) => set({ selectedAlbumId }),
  
  handleRefresh: () => 
    set((state) => ({ refreshKey: state.refreshKey + 1 })),
  
  handleAlbumChange: (albumId) => {
    set({
      selectedAlbumId: albumId
    });
    
    const event = new CustomEvent('albumChanged', { detail: { albumId } });
    window.dispatchEvent(event);
  }
}));
