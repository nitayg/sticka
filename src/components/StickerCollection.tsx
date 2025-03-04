import { useState } from "react";
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import StickerCard from "./StickerCard";
import StickerListItem from "./StickerListItem";
import EmptyState from "./EmptyState";
import AddStickerForm from "./AddStickerForm";
import StickerDetailsDialog from "./StickerDetailsDialog";
import StickerImage from "./sticker-details/StickerImage";

interface StickerCollectionProps {
  stickers: Sticker[];
  viewMode: "grid" | "list" | "compact";
  showImages?: boolean;
  selectedAlbum: string;
  onRefresh: () => void;
  activeFilter?: string | null;
  showMultipleAlbums?: boolean;
  transactionMap?: Record<string, { person: string, color: string }>;
}

const isRecentlyAdded = (sticker: Sticker): boolean => {
  const recentStickerIds = ["sticker1", "sticker5", "sticker12"];
  return recentStickerIds.includes(sticker.id);
};

const StickerCollection = ({ 
  stickers, 
  viewMode, 
  showImages = true,
  selectedAlbum, 
  onRefresh,
  activeFilter,
  showMultipleAlbums = false,
  transactionMap = {}
}: StickerCollectionProps) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const getGridColsClass = () => {
    if (viewMode === "compact") {
      return "grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16";
    }
    
    if (activeFilter) {
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
    }
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
        onUpdate={() => {
          onRefresh();
          window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
          window.dispatchEvent(new CustomEvent('albumDataChanged'));
        }}
      />
    </>
  );
};

export default StickerCollection;
