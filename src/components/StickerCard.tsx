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

// Helper function to get first name only
const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0];
};

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

  // For the card view (when compact = true), we'll use a new card design with background image
  if (compact) {
    const backgroundImageUrl = showImages && (sticker.imageUrl || album?.coverImage);
    
    return (
      <div 
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer",
          "card-hover sticker-shadow",
          "transition-all duration-300 ease-out",
          "w-full h-full min-w-[120px] max-w-[160px]",
          isRecentlyAdded && "border-yellow-400",
          transaction && transaction.color,
          className
        )}
        style={backgroundImageUrl ? {
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          backgroundColor: 'hsl(var(--muted))'
        }}
      >
        {/* Overlay for cards without image */}
        {!backgroundImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl text-muted-foreground">{sticker.number}</span>
          </div>
        )}
        
        {/* Duplicate indicator */}
        {(sticker.isDuplicate && sticker.isOwned) && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center justify-center w-6 h-6 bg-interactive text-interactive-foreground rounded-full text-xs font-semibold">
              {sticker.duplicateCount && sticker.duplicateCount > 0 ? (sticker.duplicateCount + 1) : '2+'}
            </div>
          </div>
        )}
        
        {/* Album indicator */}
        {showAlbumInfo && album && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center justify-center px-2 py-0.5 bg-black/50 text-white rounded-full text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              {album.name}
            </div>
          </div>
        )}
        
        {/* Recently added indicator */}
        {isRecentlyAdded && (
          <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
        )}
        
        {/* Text content overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-gray-800/50 rounded-b-xl px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white dark:text-gray-300">
              #{sticker.number}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-white dark:text-gray-300">
              {sticker.teamLogo ? (
                <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain" />
              ) : (
                <Shield className="w-3 h-3 opacity-50" />
              )}
              <span>{sticker.team}</span>
            </div>
          </div>
          <h3 className="font-semibold text-white dark:text-white line-clamp-1 text-sm">
            {sticker.name}
          </h3>
          
          {/* Transaction info */}
          {transaction && (
            <div className="mt-1 text-xs font-medium text-white bg-black/50 rounded-sm px-1 py-0.5 text-center truncate">
              {getFirstName(transaction.person)}
            </div>
          )}
        </div>
        
        {/* Actions overlay */}
        {showActions && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black/70">
            <button className="w-[calc(50%-0.25rem)] py-1.5 bg-interactive hover:bg-interactive-hover text-white text-xs font-medium rounded-md transition-colors duration-200">
              <Check className="h-4 w-4 mx-auto" />
            </button>
            <button className="w-[calc(50%-0.25rem)] py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-md transition-colors duration-200">
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Original non-compact view remains unchanged
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-border",
        "transition-all duration-300 ease-out",
        "card-hover sticker-shadow",
        onClick && "cursor-pointer",
        "w-full",
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
        "aspect-square"
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
          isRecentlyAdded={isRecentlyAdded}
        />
      </div>
      
      <div className={cn(
        "px-2 py-2 space-y-1",
        "dark:text-gray-200"
      )}>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-300">
              #{sticker.number}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground dark:text-gray-300">
              {sticker.teamLogo ? (
                <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain" />
              ) : (
                <Shield className="w-3 h-3 opacity-50" />
              )}
              <span>{sticker.team}</span>
            </div>
          </div>
          <h3 className={cn(
            "font-semibold text-foreground dark:text-white line-clamp-1",
            "text-base"
          )}>
            {sticker.name}
          </h3>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between pt-1">
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
            <div className="text-xs font-medium text-foreground dark:text-white bg-background/80 dark:bg-gray-700/80 rounded-sm px-2 py-0.5 text-center truncate">
              {getFirstName(transaction.person)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerCard;
