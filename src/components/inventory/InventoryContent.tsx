
import React, { useState } from "react";
import { List } from "lucide-react";
import { Button } from "../ui/button";
import EmptyState from "../EmptyState";
import StickerCollection from "../StickerCollection";
import InventoryTable from "./InventoryTable";
import { Plus } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface InventoryContentProps {
  filteredStickers: any[];
  viewMode: "grid" | "list" | "compact";
  showImages: boolean;
  selectedAlbumId: string;
  handleRefresh: () => void;
  activeTab: string;
  transactionMap: Record<string, { person: string, color: string }>;
  setIsIntakeFormOpen: (isOpen: boolean) => void;
}

const InventoryContent = ({
  filteredStickers,
  viewMode,
  showImages,
  selectedAlbumId,
  handleRefresh,
  activeTab,
  transactionMap,
  setIsIntakeFormOpen
}: InventoryContentProps) => {
  // Store the view preference in local storage
  const [useTableView, setUseTableView] = useLocalStorage("inventoryTableView", true);
  
  // Sort stickers by number
  const sortedStickers = [...filteredStickers].sort((a, b) => a.number - b.number);

  // Toggle between table and grid view
  const toggleView = () => {
    setUseTableView(!useTableView);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleView}
          className="text-xs"
        >
          {useTableView ? "תצוגת גריד" : "תצוגת טבלה"}
        </Button>
      </div>
      
      {sortedStickers.length > 0 ? (
        useTableView ? (
          <InventoryTable 
            stickers={sortedStickers}
            onRefresh={handleRefresh}
            activeTab={activeTab}
          />
        ) : (
          <StickerCollection 
            stickers={sortedStickers}
            viewMode={viewMode}
            showImages={showImages}
            selectedAlbum={selectedAlbumId}
            onRefresh={handleRefresh}
            activeFilter={activeTab === "all" ? null : activeTab}
            showMultipleAlbums={false}
            transactionMap={transactionMap}
          />
        )
      ) : (
        <EmptyState
          icon={<List className="h-10 w-10" />}
          title="לא נמצאו מדבקות"
          description={`אין מדבקות בקטגוריה "${activeTab}".`}
          action={
            <Button 
              onClick={() => setIsIntakeFormOpen(true)}
              className="px-3 py-1.5 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              הוספת מדבקה
            </Button>
          }
        />
      )}
    </>
  );
};

export default InventoryContent;
