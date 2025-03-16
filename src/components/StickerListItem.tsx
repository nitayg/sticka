
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickerListItemProps {
  sticker: Sticker;
  showImages?: boolean;
  onClick?: () => void;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  transactions?: string[];
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
  onSelect
}: StickerListItemProps) => {
  const isMobile = useIsMobile();
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
        "flex items-center space-x-4 rounded-xl border",
        "transition-all duration-300 hover:shadow-xl dark:bg-card backdrop-blur-sm",
        "min-w-[240px] relative hover-lift glass-effect", 
        (onClick || onSelect) && "cursor-pointer",
        isRecentlyAdded && "border-yellow-400 animate-pulse-brief",
        isSelected && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20",
        transaction && transaction.color,
        isMobile ? "p-2 max-w-[280px] h-[84px]" : "p-3 max-w-[300px] h-[96px]"
      )}
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
      )}
      
      <div className={cn(
        "rounded-md overflow-hidden flex-shrink-0 relative",
        transaction ? transaction.color : "bg-secondary",
        isMobile ? "h-14 w-14" : "h-16 w-16"
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
            <Image className={cn(
              "text-muted-foreground opacity-40 mb-0.5",
              isMobile ? "h-3.5 w-3.5" : "h-4 w-4"
            )} />
            <div className={cn(
              "font-bold",
              isMobile ? "text-xs" : "text-sm"
            )}>{sticker.number}</div>
            {transaction && (
              <div className={cn(
                "mt-0.5 font-medium",
                isMobile ? "text-[8px]" : "text-[9px]"
              )}>
                {getFirstName(transaction.person)}
              </div>
            )}
          </div>
        )}
        
        {transaction && showImages && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center">
            <span className={cn(
              "text-white font-medium",
              isMobile ? "text-[8px]" : "text-[9px]"
            )}>
              {getFirstName(transaction.person)}
            </span>
          </div>
        )}
      </div>
      <div className={cn(
        "flex-1 min-w-0",
        isRecentlyAdded && "animate-fade-up"
      )}>
        <div className={cn(
          "flex items-center gap-1 font-medium text-muted-foreground",
          isMobile ? "text-xs" : "text-sm"
        )}>
          <span>#{sticker.number}</span>
          <span className="mx-1">•</span>
          {sticker.teamLogo ? (
            <img src={sticker.teamLogo} alt={sticker.team} className={cn(
              "object-contain ml-1",
              isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
            )} />
          ) : (
            <Shield className={cn(
              "opacity-50 ml-1",
              isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
            )} />
          )}
          <span>{sticker.team}</span>
        </div>
        <h3 className={cn(
          "font-semibold text-foreground truncate gradient-text",
          isMobile ? "text-sm" : "text-base"
        )}>{sticker.name}</h3>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-xs" : "text-sm"
        )}>{sticker.category}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {transaction && (
          <div className={cn(
            "rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 font-medium shine-effect",
            isMobile ? "text-[9px]" : "text-xs"
          )}>
            {getFirstName(transaction.person)}
          </div>
        )}
        
        {sticker.isDuplicate && sticker.isOwned && (
          <div className={cn(
            "rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 font-medium shine-effect",
            isMobile ? "text-[9px]" : "text-xs"
          )}>
            כפול {sticker.duplicateCount && sticker.duplicateCount > 0 ? `(${sticker.duplicateCount + 1})` : ''}
          </div>
        )}
        
        {!sticker.isOwned && !transaction && (
          <div className={cn(
            "rounded-full bg-secondary/80 backdrop-blur-sm px-2 py-0.5 font-medium shine-effect",
            isMobile ? "text-[9px]" : "text-xs"
          )}>
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
