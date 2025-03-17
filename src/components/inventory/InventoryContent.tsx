
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
    <div className="animate-fade-in">
      <div className="mb-1 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleView}
          className="text-xs hover-lift glass-effect h-6 px-2"
        >
          {useTableView ? "תצוגת גריד" : "תצוגת טבלה"}
        </Button>
      </div>
      
      {sortedStickers.length > 0 ? (
        useTableView ? (
          <div className="animate-fade-in">
            <InventoryTable 
              stickers={sortedStickers}
              onRefresh={handleRefresh}
              activeTab={activeTab}
            />
          </div>
        ) : (
          <div className="animate-fade-in grid-container">
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
          </div>
        )
      ) : (
        <div className="animate-fade-in">
          <EmptyState
            icon={<List className="h-8 w-8" />}
            title="לא נמצאו מדבקות"
            description={`אין מדבקות בקטגוריה "${activeTab}".`}
            action={
              <Button 
                onClick={() => setIsIntakeFormOpen(true)}
                className="px-3 py-1 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-xs font-medium transition-colors flex items-center gap-1 hover-lift"
                size="sm"
              >
                <Plus className="h-3 w-3" />
                הוספת מדבקה
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default InventoryContent;
