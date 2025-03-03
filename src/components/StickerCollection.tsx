
import { useState, useEffect } from "react";
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import StickerCard from "./StickerCard";
import StickerListItem from "./StickerListItem";
import EmptyState from "./EmptyState";
import AddStickerForm from "./AddStickerForm";
import StickerDetailsDialog from "./StickerDetailsDialog";

interface StickerCollectionProps {
  stickers: Sticker[];
  viewMode: "grid" | "list";
  showImages?: boolean; // New prop
  selectedAlbum: string;
  onRefresh: () => void;
  activeFilter?: string | null;
  showMultipleAlbums?: boolean;
}

const StickerCollection = ({ 
  stickers, 
  viewMode, 
  showImages = true, // Default to showing images
  selectedAlbum, 
  onRefresh,
  activeFilter,
  showMultipleAlbums = false
}: StickerCollectionProps) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Adjust card size based on active filter (zoom in/out effect)
  const getGridColsClass = () => {
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
        viewMode === "grid" 
          ? `grid ${getGridColsClass()} gap-3 px-0.5` 
          : "grid grid-cols-1 gap-3"
      )}>
        {stickers.map(sticker => 
          viewMode === "grid" ? (
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
          )
        )}
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
