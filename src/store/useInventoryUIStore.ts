
import { create } from 'zustand';

type InventoryTab = "all" | "owned" | "needed" | "duplicates";
type ViewMode = "grid" | "list" | "compact";

interface InventoryUIState {
  // UI state
  activeTab: InventoryTab;
  viewMode: ViewMode;
  showImages: boolean;
  isIntakeFormOpen: boolean;
  
  // Actions
  setActiveTab: (tab: InventoryTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setShowImages: (show: boolean) => void;
  setIsIntakeFormOpen: (isOpen: boolean) => void;
}

export const useInventoryUIStore = create<InventoryUIState>((set) => ({
  // UI state
  activeTab: "all" as InventoryTab,
  viewMode: "compact" as ViewMode,
  showImages: true,
  isIntakeFormOpen: false,
  
  // Actions
  setActiveTab: (activeTab) => set({ activeTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowImages: (showImages) => set({ showImages }),
  setIsIntakeFormOpen: (isIntakeFormOpen) => set({ isIntakeFormOpen }),
}));
