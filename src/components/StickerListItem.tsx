
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image, Shield } from "lucide-react";

interface StickerListItemProps {
  sticker: Sticker;
  showImages?: boolean;
  onClick?: () => void;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
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
  isRecentlyAdded = false
}: StickerListItemProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center space-x-4 p-3 rounded-xl bg-white border border-border",
        "transition-all duration-300 ease-out hover:shadow-md dark:bg-card",
        onClick && "cursor-pointer",
        isRecentlyAdded && "border-yellow-400 animate-pulse-brief",
        transaction && transaction.color
      )}
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
      )}
      
      <div className={cn(
        "h-16 w-16 rounded-md overflow-hidden flex-shrink-0 relative",
        transaction ? transaction.color : "bg-secondary"
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
            <div className="text-sm font-bold">{sticker.number}</div>
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
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <span>#{sticker.number}</span>
          <span className="mx-1">•</span>
          {sticker.teamLogo ? (
            <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain ml-1" />
          ) : (
            <Shield className="w-3 h-3 opacity-50 ml-1" />
          )}
          <span>{sticker.team}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground truncate">{sticker.name}</h3>
        <p className="text-sm text-muted-foreground">{sticker.category}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {transaction && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            {getFirstName(transaction.person)}
          </div>
        )}
        
        {sticker.isDuplicate && sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            כפול {sticker.duplicateCount && sticker.duplicateCount > 0 ? `(${sticker.duplicateCount + 1})` : ''}
          </div>
        )}
        
        {!sticker.isOwned && !transaction && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            חסר
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerListItem;
