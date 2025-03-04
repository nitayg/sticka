
import { create } from 'zustand';
import { getStickersByAlbumId, stickerData } from '@/lib/sticker-operations';

type AlbumTab = "number" | "team" | "manage";
type ViewMode = "grid" | "list" | "compact";

interface AlbumState {
  // UI state
  viewMode: ViewMode;
  showImages: boolean;
  activeTab: AlbumTab;
  
  // Filter state
  selectedAlbumId: string;
  selectedRange: string | null;
  selectedTeam: string | null;
  showAllAlbumStickers: boolean;
  
  // Data refresh
  refreshKey: number;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setShowImages: (show: boolean) => void;
  setActiveTab: (tab: AlbumTab) => void;
  setSelectedAlbumId: (albumId: string) => void;
  setSelectedRange: (range: string | null) => void;
  setSelectedTeam: (team: string | null) => void;
  setShowAllAlbumStickers: (show: boolean) => void;
  
  handleRefresh: () => void;
  handleAlbumChange: (albumId: string) => void;
  handleRangeSelect: (range: string | null) => void;
  handleTeamSelect: (team: string | null) => void;
  handleTeamsManagement: () => void;
}

export const useAlbumStore = create<AlbumState>((set) => ({
  // UI state
  viewMode: "compact",
  showImages: true,
  activeTab: "number",
  
  // Filter state
  selectedAlbumId: "",
  selectedRange: null,
  selectedTeam: null,
  showAllAlbumStickers: false,
  
  // Data refresh
  refreshKey: 0,
  
  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setShowImages: (showImages) => set({ showImages }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedAlbumId: (selectedAlbumId) => set({ selectedAlbumId }),
  setSelectedRange: (selectedRange) => set({ selectedRange }),
  setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
  setShowAllAlbumStickers: (showAllAlbumStickers) => set({ showAllAlbumStickers }),
  
  handleRefresh: () => 
    set((state) => ({ refreshKey: state.refreshKey + 1 })),
  
  handleAlbumChange: (albumId) => {
    set({
      selectedAlbumId: albumId,
      showAllAlbumStickers: false,
      selectedRange: null,
      selectedTeam: null
    });
    
    const event = new CustomEvent('albumChanged', { detail: { albumId } });
    window.dispatchEvent(event);
  },
  
  handleRangeSelect: (range) => 
    set({ selectedRange: range }),
  
  handleTeamSelect: (team) => 
    set({ selectedTeam: team }),
  
  handleTeamsManagement: () => 
    set({ activeTab: "manage", showAllAlbumStickers: true })
}));
