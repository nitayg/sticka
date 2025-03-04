
import { useState, useEffect } from "react";
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import StickerCard from "./StickerCard";
import StickerListItem from "./StickerListItem";
import EmptyState from "./EmptyState";
import AddStickerForm from "./AddStickerForm";
import StickerDetailsDialog from "./StickerDetailsDialog";
import StickerImage from "./sticker-details/StickerImage";
import { getStickerTransactions } from "@/lib/sticker-operations";

interface StickerCollectionProps {
  stickers: Sticker[];
  viewMode: "grid" | "list" | "compact";
  showImages?: boolean;
  selectedAlbum: string;
  onRefresh: () => void;
  activeFilter?: string | null;
  showMultipleAlbums?: boolean;
}

// Utility function to check if a sticker was recently added (within the last 5 minutes)
const isRecentlyAdded = (sticker: Sticker): boolean => {
  // Mock implementation - in a real app, you would compare with the actual creation timestamp
  const recentStickerIds = ["sticker1", "sticker5", "sticker12"]; // Example for demo
  return recentStickerIds.includes(sticker.id);
};

const StickerCollection = ({ 
  stickers, 
  viewMode, 
  showImages = true,
  selectedAlbum, 
  onRefresh,
  activeFilter,
  showMultipleAlbums = false
}: StickerCollectionProps) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionMap, setTransactionMap] = useState<Record<string, { person: string, color: string }>>({}); 
  
  useEffect(() => {
    // Fetch transaction data
    setTransactionMap(getStickerTransactions());
  }, [stickers]);
  
  // Adjust card size based on active filter and view mode
  const getGridColsClass = () => {
    if (viewMode === "compact") {
      return "grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16";
    }
    
    // When filtered, show more cards by reducing their size
    if (activeFilter) {
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
    }
    // Default size
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };
  
  const handleStickerClick = (sticker: Sticker) => {
    setSelectedSticker(sticker);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSticker(null);
  };

  if (stickers.length === 0) {
    return (
      <EmptyState
        icon={<Image className="h-12 w-12" />}
        title="לא נמצאו מדבקות"
        description="הוסף מדבקות לאוסף שלך או שנה את קריטריוני הסינון."
        action={
          <AddStickerForm 
            onStickerAdded={onRefresh} 
            defaultAlbumId={selectedAlbum}
          />
        }
      />
    );
  }

  return (
    <>
      <div className={cn(
        "w-full animate-scale-in",
        viewMode === "list" 
          ? "grid grid-cols-1 gap-3" 
          : `grid ${getGridColsClass()} gap-3 px-0.5`
      )}>
        {stickers.map(sticker => {
          const transaction = transactionMap[sticker.id];
          const recentlyAdded = isRecentlyAdded(sticker);
          
          if (viewMode === "compact") {
            return (
              <div key={sticker.id} onClick={() => handleStickerClick(sticker)} className="cursor-pointer">
                <StickerImage
                  alt={sticker.name}
                  stickerNumber={sticker.number}
                  isOwned={sticker.isOwned}
                  isDuplicate={sticker.isDuplicate}
                  duplicateCount={sticker.duplicateCount}
                  inTransaction={!!transaction}
                  transactionColor={transaction?.color}
                  transactionPerson={transaction?.person}
                  compactView={true}
                  isRecentlyAdded={recentlyAdded}
                />
              </div>
            );
          }
          
          return viewMode === "grid" ? (
            <StickerCard 
              key={sticker.id} 
              sticker={sticker} 
              compact
              showImages={showImages}
              showAlbumInfo={showMultipleAlbums}
              onClick={() => handleStickerClick(sticker)}
              transaction={transaction}
              isRecentlyAdded={recentlyAdded}
            />
          ) : (
            <StickerListItem 
              key={sticker.id} 
              sticker={sticker}
              showImages={showImages}
              onClick={() => handleStickerClick(sticker)}
              transaction={transaction}
              isRecentlyAdded={recentlyAdded}
            />
          );
        })}
      </div>
      
      <StickerDetailsDialog
        sticker={selectedSticker}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onUpdate={onRefresh}
      />
    </>
  );
};

export default StickerCollection;
