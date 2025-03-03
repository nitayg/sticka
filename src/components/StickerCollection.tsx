
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import StickerCard from "./StickerCard";
import StickerListItem from "./StickerListItem";
import EmptyState from "./EmptyState";
import AddStickerForm from "./AddStickerForm";

interface StickerCollectionProps {
  stickers: Sticker[];
  viewMode: "grid" | "list";
  selectedAlbum: string;
  onRefresh: () => void;
}

const StickerCollection = ({ stickers, viewMode, selectedAlbum, onRefresh }: StickerCollectionProps) => {
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
            onClick={() => console.log(`Selected ${sticker.name}`)}
          />
        ) : (
          <StickerListItem 
            key={sticker.id} 
            sticker={sticker} 
            onClick={() => console.log(`Selected ${sticker.name}`)}
          />
        )
      )}
    </div>
  );
};

export default StickerCollection;
