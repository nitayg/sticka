
import { Image } from "lucide-react";
import { Album } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StickerImageProps {
  imageUrl?: string;
  fallbackImage?: string;
  alt: string;
  stickerNumber?: number;
  showImage?: boolean;
  isOwned?: boolean;
  isDuplicate?: boolean;
  duplicateCount?: number;
  inTransaction?: boolean;
  transactionColor?: string;
  compactView?: boolean;
  transactionPerson?: string;
  isRecentlyAdded?: boolean;
}

const StickerImage = ({ 
  imageUrl, 
  fallbackImage, 
  alt, 
  stickerNumber,
  showImage = true,
  isOwned = false,
  isDuplicate = false,
  duplicateCount = 0,
  inTransaction = false,
  transactionColor,
  transactionPerson,
  compactView = false,
  isRecentlyAdded = false
}: StickerImageProps) => {
  // Determine background color based on sticker status
  const getBgColor = () => {
    if (inTransaction && transactionColor) return transactionColor;
    if (isOwned) return "bg-green-100 border-green-300";
    return "bg-muted border-muted-foreground/20";
  };

  if (compactView) {
    return (
      <div className={cn(
        "relative aspect-square rounded-lg overflow-hidden border flex items-center justify-center transition-all",
        getBgColor(),
        isDuplicate && isOwned && "ring-2 ring-interactive",
        isRecentlyAdded && "animate-pulse-brief border-yellow-400"
      )}>
        {stickerNumber && (
          <div className={cn(
            "text-lg font-bold",
            isOwned ? "text-green-800" : "text-muted-foreground",
            inTransaction && "text-foreground"
          )}>
            {stickerNumber}
          </div>
        )}
        {isDuplicate && isOwned && (
          <div className="absolute top-1 right-1 text-xs font-semibold text-interactive">
            {duplicateCount > 0 ? duplicateCount + 1 : '2+'}
          </div>
        )}
        {inTransaction && transactionPerson && (
          <div className="absolute bottom-1 right-1 text-[9px] font-medium max-w-[80%] truncate bg-background/80 px-1 rounded-sm">
            {transactionPerson}
          </div>
        )}
        {isRecentlyAdded && (
          <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[12px] border-t-yellow-400 border-r-[12px] border-r-transparent"></div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "relative aspect-square rounded-lg overflow-hidden border order-1 md:order-2",
      isRecentlyAdded && "animate-pulse-brief border-yellow-400"
    )}>
      {showImage ? (
        imageUrl ? (
          <img 
            src={imageUrl} 
            alt={alt} 
            className="w-full h-full object-cover"
          />
        ) : fallbackImage ? (
          <img 
            src={fallbackImage} 
            alt={alt} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Image className="h-12 w-12 text-muted-foreground" />
          </div>
        )
      ) : (
        <div className={cn(
          "w-full h-full flex flex-col items-center justify-center",
          inTransaction && transactionColor ? transactionColor : "bg-muted"
        )}>
          <Image className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
          {stickerNumber && <div className="text-3xl font-bold">{stickerNumber}</div>}
          
          {inTransaction && transactionPerson && (
            <div className="mt-2 text-xs font-medium bg-background/80 px-2 py-1 rounded-sm">
              החלפה עם {transactionPerson}
            </div>
          )}
        </div>
      )}
      
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[20px] border-t-yellow-400 border-r-[20px] border-r-transparent"></div>
      )}
    </div>
  );
};

export default StickerImage;
