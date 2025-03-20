
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image, Shield } from "lucide-react";

interface StickerListItemProps {
  sticker: Sticker;
  showImages?: boolean;
  onClick?: () => void;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  transactions?: string[];
  className?: string; // Add className to the interface
}

// Helper function to get first name only
const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0];
};

const StickerListItem = ({ 
  sticker, 
  showImages = true, 
  onClick,
  transaction,
  isRecentlyAdded = false,
  isSelected,
  onSelect,
  className
}: StickerListItemProps) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex items-center space-x-4 p-2 rounded-xl border", // Reduced padding to p-2
        "transition-all duration-300 hover:shadow-xl dark:bg-card backdrop-blur-sm",
        "min-w-[240px] max-w-[300px] h-[80px] relative hover-lift glass-effect", // Reduced height to 80px
        (onClick || onSelect) && "cursor-pointer",
        isRecentlyAdded && "border-yellow-400 animate-pulse-brief",
        isSelected && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20",
        transaction ? transaction.color : "",
        sticker.isOwned && !transaction ? "border-green-500" : "",
        className
      )}
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
      )}
      
      <div className={cn(
        "h-14 w-14 rounded-md overflow-hidden flex-shrink-0 relative", // Reduced height/width to h-14 w-14
        transaction ? transaction.color : sticker.isOwned ? "bg-green-50" : "bg-secondary"
      )}>
        {showImages ? (
          <img 
            src={sticker.imageUrl} 
            alt={sticker.name} 
            className={cn(
              "w-full h-full object-cover",
              isRecentlyAdded && "animate-scale-in"
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Image className="h-4 w-4 text-muted-foreground mb-0.5 opacity-40" />
            <div className={cn(
              "text-sm font-bold",
              sticker.isOwned && !transaction ? "text-green-700" : ""
            )}>
              {sticker.number}
            </div>
            {transaction && (
              <div className="mt-0.5 text-[9px] font-medium">
                {getFirstName(transaction.person)}
              </div>
            )}
          </div>
        )}
        
        {transaction && showImages && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center">
            <span className="text-[9px] text-white font-medium">
              {getFirstName(transaction.person)}
            </span>
          </div>
        )}
      </div>
      <div className={cn(
        "flex-1 min-w-0",
        isRecentlyAdded && "animate-fade-up"
      )}>
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground"> {/* Reduced text size */}
          <span className={sticker.isOwned && !transaction ? "text-green-700" : ""}>#{sticker.number}</span>
          <span className="mx-1">•</span>
          {sticker.teamLogo ? (
            <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain ml-1" />
          ) : (
            <Shield className="w-3 h-3 opacity-50 ml-1" />
          )}
          <span>{sticker.team}</span>
        </div>
        <h3 className={cn(
          "text-sm font-semibold truncate gradient-text",
          sticker.isOwned && !transaction ? "text-green-700" : "text-foreground"
        )}>
          {sticker.name}
        </h3> {/* Reduced text size */}
        <p className="text-xs text-muted-foreground">{sticker.category}</p> {/* Reduced text size */}
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {transaction && (
          <div className="rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium shine-effect"> {/* Reduced padding */}
            {getFirstName(transaction.person)}
          </div>
        )}
        
        {sticker.isDuplicate && sticker.isOwned && (
          <div className="rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium shine-effect"> {/* Reduced padding */}
            כפול {sticker.duplicateCount && sticker.duplicateCount > 0 ? `(${sticker.duplicateCount + 1})` : ''}
          </div>
        )}
        
        {!sticker.isOwned && !transaction && (
          <div className="rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium shine-effect"> {/* Reduced padding */}
            חסר
          </div>
        )}
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
    </div>
  );
};

export default StickerListItem;
