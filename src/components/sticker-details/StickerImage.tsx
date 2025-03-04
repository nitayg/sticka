
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
  compactView = false
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
        "relative h-7 w-7 xxs:h-8 xxs:w-8 xs:h-9 xs:w-9 sm:h-8 sm:w-8 md:h-7 md:w-7 lg:h-7 lg:w-7 xl:h-8 xl:w-8 rounded-md overflow-hidden border flex items-center justify-center transition-all",
        getBgColor(),
        isDuplicate && isOwned && "ring-1 ring-interactive"
      )}>
        {stickerNumber && (
          <div className={cn(
            "font-bold",
            isOwned ? "text-green-800" : "text-muted-foreground",
            inTransaction && "text-foreground",
            // Adjust text size based on number length
            stickerNumber > 999 ? "text-[7px] xxs:text-[8px] xs:text-[9px]" : 
            stickerNumber > 99 ? "text-[8px] xxs:text-[9px] xs:text-[10px]" : 
            "text-[9px] xxs:text-[10px] xs:text-xs"
          )}>
            {stickerNumber}
          </div>
        )}
        {isDuplicate && isOwned && duplicateCount > 0 && (
          <div className="absolute bottom-0 right-0 text-[6px] font-semibold text-interactive">
            {duplicateCount + 1}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border order-1 md:order-2">
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
          <Image className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
          {stickerNumber && <div className="text-3xl font-bold">{stickerNumber}</div>}
        </div>
      )}
    </div>
  );
};

export default StickerImage;
