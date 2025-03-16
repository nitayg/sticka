
import { useState } from "react";
import { Sticker } from "@/lib/types";
import { Image } from "lucide-react";
import StickerCard from "./StickerCard";
import StickerListItem from "./StickerListItem";
import EmptyState from "./EmptyState";
import AddStickerForm from "./AddStickerForm";
import StickerDetailsDialog from "./StickerDetailsDialog";
import { isRecentlyAdded } from "@/lib/sticker-utils";
import CompactStickerItem from "./sticker-collection/CompactStickerItem";
import StickerCollectionGrid from "./sticker-collection/StickerCollectionGrid";

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

  // We don't need to sort here since the stickers should already be sorted by the parent component
  
  return (
    <>
      <StickerCollectionGrid 
        viewMode={viewMode} 
        activeFilter={activeFilter}
      >
        {stickers.map(sticker => {
          const transaction = transactionMap[sticker.id];
          const recentlyAdded = isRecentlyAdded(sticker);
          
          if (viewMode === "compact") {
            return (
              <CompactStickerItem
                key={sticker.id}
                sticker={sticker}
                transaction={transaction}
                isRecentlyAdded={recentlyAdded}
                onClick={() => handleStickerClick(sticker)}
              />
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
      </StickerCollectionGrid>
      
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
