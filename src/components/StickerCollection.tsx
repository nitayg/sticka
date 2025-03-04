
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

interface StickerCollectionProps {
  stickers: Sticker[];
  viewMode: "grid" | "list" | "compact";
  showImages?: boolean;
  selectedAlbum: string;
  onRefresh: () => void;
  activeFilter?: string | null;
  showMultipleAlbums?: boolean;
}

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
  const [gridColsClass, setGridColsClass] = useState("");
  
  // Calculate the appropriate grid layout based on sticker count and view mode
  useEffect(() => {
    if (viewMode === "compact") {
      // Dynamic grid sizing based on sticker count
      const count = stickers.length;
      
      if (count > 200) {
        setGridColsClass("grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 xl:grid-cols-24");
      } else if (count > 100) {
        setGridColsClass("grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 xl:grid-cols-20");
      } else if (count > 50) {
        setGridColsClass("grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-18");
      } else {
        setGridColsClass("grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16");
      }
    } else if (activeFilter) {
      // When filtered, show more cards by reducing their size
      setGridColsClass("grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8");
    } else {
      // Default size
      setGridColsClass("grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5");
    }
  }, [stickers.length, viewMode, activeFilter]);
  
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

  // Mock transaction data - in a real app, this would come from your transaction store
  const transactionMap: Record<string, { person: string, color: string }> = {
    // These are examples - you would populate this from your actual transaction data
    "sticker3": { person: "דני", color: "bg-purple-100 border-purple-300" },
    "sticker7": { person: "יוסי", color: "bg-blue-100 border-blue-300" },
    "sticker15": { person: "רותי", color: "bg-pink-100 border-pink-300" },
  };

  return (
    <>
      <div className={cn(
        "w-full animate-scale-in",
        viewMode === "list" 
          ? "grid grid-cols-1 gap-2" 
          : viewMode === "compact"
            ? `grid ${gridColsClass} gap-1.5`
            : `grid ${gridColsClass} gap-3 px-0.5`
      )}>
        {stickers.map(sticker => {
          const transaction = transactionMap[sticker.id];
          
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
                  compactView={true}
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
            />
          ) : (
            <StickerListItem 
              key={sticker.id} 
              sticker={sticker}
              showImages={showImages}
              onClick={() => handleStickerClick(sticker)}
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
