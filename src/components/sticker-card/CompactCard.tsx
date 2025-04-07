
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import StickerImage from "../sticker-details/StickerImage";

interface CompactCardProps {
  sticker: Sticker;
  onClick?: () => void;
  showImages?: boolean;
  showAlbumInfo?: boolean;
  transaction?: { person: string, color: string } | null;
  isRecentlyAdded?: boolean;
  className?: string;
}

const CompactCard = ({
  sticker,
  onClick,
  showImages = true,
  showAlbumInfo = false,
  transaction,
  isRecentlyAdded = false,
  className
}: CompactCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border overflow-hidden cursor-pointer h-full transition-shadow duration-200",
        "hover:shadow-md flex items-center gap-2 p-2",
        transaction ? transaction.color : sticker.isOwned ? "bg-green-50 border-green-300" : "bg-card border-border",
        isRecentlyAdded && "border-yellow-400",
        className
      )}
      dir="rtl"
    >
      {showImages && (
        <div className="w-10 h-10 flex-shrink-0">
          <StickerImage
            imageUrl={sticker.imageUrl}
            fallbackImage={sticker.teamLogo}
            alt={sticker.name || `Sticker ${sticker.number}`}
            stickerNumber={sticker.number}
            showImage={showImages}
            isOwned={sticker.isOwned}
            isDuplicate={sticker.isDuplicate}
            duplicateCount={sticker.duplicateCount}
            inTransaction={!!transaction}
            transactionColor={transaction?.color}
            compactView={true}
            transactionPerson={transaction?.person}
            isRecentlyAdded={isRecentlyAdded}
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline">
          <span className="text-sm font-medium ml-1">#{sticker.number}</span>
          <span className="text-xs truncate">{sticker.name}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {sticker.team}
          {showAlbumInfo && sticker.albumName && (
            <span className="mr-1">({sticker.albumName})</span>
          )}
        </div>
      </div>
      
      {sticker.isOwned && sticker.isDuplicate && (
        <div className="h-5 w-5 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-xs font-medium border border-yellow-200">
          {sticker.duplicateCount && sticker.duplicateCount > 0 ? sticker.duplicateCount + 1 : '2+'}
        </div>
      )}
    </div>
  );
};

export default CompactCard;
