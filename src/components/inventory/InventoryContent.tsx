
import React, { useState } from "react";
import { List } from "lucide-react";
import { Button } from "../ui/button";
import EmptyState from "../EmptyState";
import StickerCollection from "../StickerCollection";
import InventoryTable from "./InventoryTable";
import { Plus } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();
  
  // Sort stickers by number
  const sortedStickers = [...filteredStickers].sort((a, b) => a.number - b.number);

  // Toggle between table and grid view
  const toggleView = () => {
    setUseTableView(!useTableView);
  };

  return (
    <div className="animate-fade-in">
      <div className={cn(
        "flex justify-end",
        isMobile ? "mb-2" : "mb-4"
      )}>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"} 
          onClick={toggleView}
          className={cn(
            "hover-lift glass-effect",
            isMobile ? "text-[10px] py-1 px-2" : "text-xs"
          )}
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
          <div className="animate-fade-in">
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
            icon={<List className="h-10 w-10" />}
            title="לא נמצאו מדבקות"
            description={`אין מדבקות בקטגוריה "${activeTab}".`}
            action={
              <Button 
                onClick={() => setIsIntakeFormOpen(true)}
                className={cn(
                  "rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground font-medium transition-colors flex items-center gap-1 hover-lift",
                  isMobile ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
                )}
              >
                <Plus className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
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
