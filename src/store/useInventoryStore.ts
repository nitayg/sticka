
import { useInventoryUIStore } from './useInventoryUIStore';
import { useInventoryDataStore } from './useInventoryDataStore';

// This is a facade that combines both UI and data stores
// to maintain backward compatibility with existing components
export const useInventoryStore = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    isIntakeFormOpen,
    setIsIntakeFormOpen
  } = useInventoryUIStore();
  
  const {
    selectedAlbumId,
    refreshKey,
    transactionMap,
    setSelectedAlbumId,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake,
    updateTransactionMap
  } = useInventoryDataStore();
  
  return {
    // UI state
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    isIntakeFormOpen,
    setIsIntakeFormOpen,
    
    // Data state
    selectedAlbumId,
    refreshKey,
    transactionMap,
    
    // Actions
    setSelectedAlbumId,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake,
    updateTransactionMap
  };
};
