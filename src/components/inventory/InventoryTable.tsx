import React, { useEffect } from "react";
import { Sticker } from "@/lib/types";
import InventoryTableHeader from "./InventoryTableHeader";
import InventoryTableRow from "./InventoryTableRow";
import InventorySearchControls from "./InventorySearchControls";
import InventoryBulkControls from "./InventoryBulkControls";
import { useStickerSort } from "./useStickerSort";
import { useInventoryActions } from "./useInventoryActions";
import { useInventorySearch } from "./useInventorySearch";

interface InventoryTableProps {
  stickers: Sticker[];
  onRefresh: () => void;
  activeTab: string;
}

const InventoryTable = ({ stickers, onRefresh, activeTab }: InventoryTableProps) => {
  // Custom hooks for different functionality
  const { searchTerm, setSearchTerm, filteredStickers } = useInventorySearch(stickers);
  const { sortedStickers, sortConfig, requestSort } = useStickerSort(filteredStickers);
  const {
    selectedStickers,
    isSelectMode,
    toggleSelectMode,
    toggleSelectAll,
    toggleStickerSelection,
    handleInventoryUpdate,
    handleBulkInventoryUpdate
  } = useInventoryActions(onRefresh);

  // Reset selected stickers when stickers change or select mode is disabled
  useEffect(() => {
    if (!isSelectMode) {
      // This will be handled by the hook
    }
  }, [stickers, isSelectMode]);

  // Calculate inventory count for a sticker
  const getInventoryCount = (sticker: Sticker) => {
    if (!sticker.isOwned) return 0;
    return (sticker.duplicateCount || 0) + 1; // Add 1 for the owned sticker
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <InventorySearchControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <InventoryBulkControls
          isSelectMode={isSelectMode}
          selectedCount={selectedStickers.length}
          onToggleSelectMode={toggleSelectMode}
          onToggleSelectAll={() => toggleSelectAll(sortedStickers)}
          onBulkAdd={() => handleBulkInventoryUpdate(stickers, true)}
          totalItems={sortedStickers.length}
        />
      </div>
      
      <div className="relative rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <InventoryTableHeader
            onSort={requestSort}
            sortConfig={sortConfig}
            isSelectMode={isSelectMode}
            onToggleSelectAll={() => toggleSelectAll(sortedStickers)}
            selectedStickersCount={selectedStickers.length}
            totalStickersCount={sortedStickers.length}
          />
          <tbody>
            {sortedStickers.map((sticker, index) => (
              <InventoryTableRow
                key={sticker.id}
                sticker={sticker}
                index={index}
                isSelectMode={isSelectMode}
                isSelected={selectedStickers.includes(sticker.id)}
                onToggleSelection={toggleStickerSelection}
                onUpdateInventory={handleInventoryUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
