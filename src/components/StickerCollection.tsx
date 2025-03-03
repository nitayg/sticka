
import { useState } from "react";
import { Sticker } from "@/lib/data";
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
  selectedAlbum: string;
  onRefresh: () => void;
}

const StickerCollection = ({ stickers, viewMode, selectedAlbum, onRefresh }: StickerCollectionProps) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-0.5" 
          : "grid grid-cols-1 gap-3"
      )}>
        {stickers.map(sticker => 
          viewMode === "grid" ? (
            <StickerCard 
              key={sticker.id} 
              sticker={sticker} 
              compact
              onClick={() => handleStickerClick(sticker)}
            />
          ) : (
            <StickerListItem 
              key={sticker.id} 
              sticker={sticker} 
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
