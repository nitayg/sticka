
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, Shield, X, BookOpen } from "lucide-react";
import { getAlbumById } from "@/lib/album-operations";
import StickerImage from "./sticker-details/StickerImage";

interface StickerCardProps {
  sticker: Sticker;
  compact?: boolean;
  showActions?: boolean;
  showAlbumInfo?: boolean;
  showImages?: boolean;
  onClick?: () => void;
  className?: string;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
}

const StickerCard = ({ 
  sticker, 
  compact = false, 
  showActions = false,
  showAlbumInfo = false,
  showImages = true,
  onClick, 
  className,
  transaction,
  isRecentlyAdded = false
}: StickerCardProps) => {
  // Get the album to use its image as a fallback
  const album = getAlbumById(sticker.albumId);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-border",
        "transition-all duration-300 ease-out",
        "card-hover sticker-shadow",
        onClick && "cursor-pointer",
        compact ? "w-full max-w-[160px]" : "w-full",
        isRecentlyAdded && "border-yellow-400",
        transaction && transaction.color,
        className
      )}
    >
      {(sticker.isDuplicate && sticker.isOwned) && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center justify-center w-6 h-6 bg-interactive text-interactive-foreground rounded-full text-xs font-semibold">
            {sticker.duplicateCount && sticker.duplicateCount > 0 ? (sticker.duplicateCount + 1) : '2+'}
          </div>
        </div>
      )}
      
      {showAlbumInfo && album && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center justify-center px-2 py-0.5 bg-black/50 text-white rounded-full text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            {album.name}
          </div>
        </div>
      )}
      
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
      )}
      
      <div className={cn(
        "relative w-full overflow-hidden", 
        compact ? "aspect-[3/4]" : "aspect-square"
      )}>
        <StickerImage
          imageUrl={sticker.imageUrl}
          fallbackImage={album?.coverImage}
          alt={sticker.name}
          stickerNumber={sticker.number}
          showImage={showImages}
          isOwned={sticker.isOwned}
          isDuplicate={sticker.isDuplicate}
          duplicateCount={sticker.duplicateCount}
          inTransaction={!!transaction}
          transactionColor={transaction?.color}
          transactionPerson={transaction?.person}
        />
      </div>
      
      <div className={cn(
        "p-3",
        compact ? "space-y-0.5" : "space-y-2"
      )}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              #{sticker.number}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              {sticker.teamLogo ? (
                <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain" />
              ) : (
                <Shield className="w-3 h-3 opacity-50" />
              )}
              <span>{sticker.team}</span>
            </div>
          </div>
          <h3 className={cn(
            "font-semibold text-foreground line-clamp-1",
            compact ? "text-sm" : "text-base"
          )}>
            {sticker.name}
          </h3>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between pt-2">
            <button className="w-[calc(50%-0.25rem)] py-1.5 bg-interactive hover:bg-interactive-hover text-white text-xs font-medium rounded-md transition-colors duration-200">
              <Check className="h-4 w-4 mx-auto" />
            </button>
            <button className="w-[calc(50%-0.25rem)] py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-md transition-colors duration-200">
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>
        )}
        
        {transaction && (
          <div className="pt-1">
            <div className="text-xs font-medium text-foreground bg-background/80 rounded-sm px-2 py-0.5 text-center">
              {transaction.person}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerCard;
