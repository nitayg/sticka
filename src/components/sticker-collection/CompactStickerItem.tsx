
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompactStickerItemProps {
  sticker: Sticker;
  onClick: () => void;
  isRecentlyAdded?: boolean;
  transaction?: { person: string, color: string } | null;
}

// Helper to get first name
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

const CompactStickerItem = ({
  sticker,
  onClick,
  isRecentlyAdded = false,
  transaction
}: CompactStickerItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-md cursor-pointer",
        "border border-border transition-all duration-200 hover:shadow-sm",
        "relative overflow-hidden",
        isMobile ? "w-12 h-12 min-w-[48px] min-h-[48px] mb-1" : "w-14 h-14 min-w-[56px] min-h-[56px] mb-1.5",
        transaction ? transaction.color : "bg-card",
        isRecentlyAdded && "border-yellow-400"
      )}
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[10px] border-t-yellow-400 border-r-[10px] border-r-transparent z-10"></div>
      )}
      
      <span className={cn(
        "font-bold text-foreground",
        isMobile ? "text-base" : "text-lg"
      )}>
        {sticker.number}
      </span>
      
      {(sticker.isDuplicate && sticker.isOwned) && (
        <div className={cn(
          "absolute top-0.5 right-0.5 bg-interactive rounded-full flex items-center justify-center",
          isMobile ? "w-3 h-3" : "w-3.5 h-3.5"
        )}>
          <span className={cn(
            "font-bold text-interactive-foreground",
            isMobile ? "text-[7px]" : "text-[8px]"
          )}>
            {sticker.duplicateCount && sticker.duplicateCount > 0 ? (sticker.duplicateCount + 1) : '2+'}
          </span>
        </div>
      )}
      
      {transaction && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-center py-0.5">
          <span className={cn(
            "font-medium text-white",
            isMobile ? "text-[7px]" : "text-[8px]"
          )}>
            {getFirstName(transaction.person)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompactStickerItem;
