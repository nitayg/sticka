
import { Image } from "lucide-react";
import { Album } from "@/lib/types";
import { cn } from "@/lib/utils";

// Helper function to get first name only
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

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
        isDuplicate && isOwned && "ring-1 ring-interactive", // Reduced ring size
        isRecentlyAdded && "animate-pulse-brief border-yellow-400"
      )}>
        {stickerNumber && (
          <div className={cn(
            "text-base font-bold", // Reduced text size
            isOwned ? "text-green-800" : "text-muted-foreground",
            inTransaction && "text-foreground"
          )}>
            {stickerNumber}
          </div>
        )}
        {isDuplicate && isOwned && (
          <div className="absolute top-0.5 right-0.5 text-xs font-semibold text-interactive"> {/* Adjusted position */}
            {duplicateCount > 0 ? duplicateCount + 1 : '2+'}
          </div>
        )}
        {isRecentlyAdded && (
          <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[10px] border-t-yellow-400 border-r-[10px] border-r-transparent"></div> {/* Reduced indicator size */}
        )}
        {inTransaction && transactionPerson && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-[8px] py-0.5 truncate"> {/* Reduced text size */}
            {getFirstName(transactionPerson)}
          </div>
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
          <>
            <img 
              src={imageUrl} 
              alt={alt} 
              className="w-full h-full object-cover"
            />
            {inTransaction && transactionPerson && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-0.5 text-xs"> {/* Reduced padding */}
                {getFirstName(transactionPerson)}
              </div>
            )}
          </>
        ) : fallbackImage ? (
          <>
            <img 
              src={fallbackImage} 
              alt={alt} 
              className="w-full h-full object-cover opacity-60"
            />
            {inTransaction && transactionPerson && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-0.5 text-xs"> {/* Reduced padding */}
                {getFirstName(transactionPerson)}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Image className="h-8 w-8 text-muted-foreground" /> {/* Reduced icon size */}
          </div>
        )
      ) : (
        <div className={cn(
          "w-full h-full flex flex-col items-center justify-center",
          inTransaction && transactionColor ? transactionColor : "bg-muted"
        )}>
          <Image className="h-8 w-8 text-muted-foreground mb-1 opacity-40" /> {/* Reduced icon size and margin */}
          {stickerNumber && <div className="text-2xl font-bold">{stickerNumber}</div>} {/* Reduced text size */}
          
          {inTransaction && transactionPerson && (
            <div className="mt-1 text-xs font-medium bg-background/80 px-2 py-0.5 rounded-sm"> {/* Reduced margin */}
              {getFirstName(transactionPerson)}
            </div>
          )}
        </div>
      )}
      
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div> {/* Reduced indicator size */}
      )}
    </div>
  );
};

export default StickerImage;
