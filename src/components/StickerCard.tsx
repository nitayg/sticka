
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Check, Shield, X, BookOpen, Image } from "lucide-react";
import { getAlbumById } from "@/lib/album-operations";

interface StickerCardProps {
  sticker: Sticker;
  compact?: boolean;
  showActions?: boolean;
  showAlbumInfo?: boolean;
  showImages?: boolean;
  onClick?: () => void;
  className?: string;
}

const StickerCard = ({ 
  sticker, 
  compact = false, 
  showActions = false,
  showAlbumInfo = false,
  showImages = true,
  onClick, 
  className 
}: StickerCardProps) => {
  // Get the album to use its image as a fallback
  const album = getAlbumById(sticker.albumId);
  const displayImage = sticker.imageUrl || album?.coverImage;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-border",
        "transition-all duration-300 ease-out",
        "card-hover sticker-shadow",
        onClick && "cursor-pointer",
        compact ? "w-full max-w-[160px]" : "w-full",
        className
      )}
    >
      {(sticker.isDuplicate && sticker.isOwned) && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center justify-center w-6 h-6 bg-interactive text-interactive-foreground rounded-full text-xs font-semibold">
            2+
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
      
      <div className={cn(
        "relative w-full overflow-hidden", 
        compact ? "aspect-[3/4]" : "aspect-square"
      )}>
        {showImages ? (
          displayImage ? (
            <img 
              src={displayImage} 
              alt={sticker.name} 
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                "group-hover:scale-105",
                !sticker.imageUrl && "opacity-70" // Make album fallback image slightly transparent
              )} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-xs">No Image</span>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
            <Image className="h-6 w-6 text-muted-foreground mb-1 opacity-40" />
            <div className="text-2xl font-bold">{sticker.number}</div>
          </div>
        )}
        
        {!sticker.isOwned && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded-md">
              Need
            </span>
          </div>
        )}
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
      </div>
    </div>
  );
};

export default StickerCard;
