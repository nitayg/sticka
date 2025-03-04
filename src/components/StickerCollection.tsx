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
  
  useEffect(() => {
    if (viewMode === "compact") {
      const count = stickers.length;
      
      if (count > 500) {
        setGridColsClass("grid-cols-24 xxs:grid-cols-36 xs:grid-cols-46 sm:grid-cols-60 md:grid-cols-70 lg:grid-cols-80 xl:grid-cols-90");
      } else if (count > 300) {
        setGridColsClass("grid-cols-20 xxs:grid-cols-30 xs:grid-cols-40 sm:grid-cols-50 md:grid-cols-60 lg:grid-cols-70 xl:grid-cols-80");
      } else if (count > 200) {
        setGridColsClass("grid-cols-16 xxs:grid-cols-24 xs:grid-cols-36 sm:grid-cols-42 md:grid-cols-50 lg:grid-cols-60 xl:grid-cols-70");
      } else if (count > 100) {
        setGridColsClass("grid-cols-12 xxs:grid-cols-18 xs:grid-cols-24 sm:grid-cols-36 md:grid-cols-42 lg:grid-cols-50 xl:grid-cols-60");
      } else {
        setGridColsClass("grid-cols-10 xxs:grid-cols-15 xs:grid-cols-20 sm:grid-cols-30 md:grid-cols-36 lg:grid-cols-40 xl:grid-cols-48");
      }
    } else if (activeFilter) {
      setGridColsClass("grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8");
    } else {
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

  const transactionMap: Record<string, { person: string, color: string }> = {
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
            ? `grid ${gridColsClass} gap-0 p-0`
            : `grid ${gridColsClass} gap-3 px-0.5`
      )}>
        {stickers.map(sticker => {
          const transaction = transactionMap[sticker.id];
          
          if (viewMode === "compact") {
            return (
              <div 
                key={sticker.id} 
                onClick={() => handleStickerClick(sticker)} 
                className="cursor-pointer flex items-center justify-center"
              >
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
