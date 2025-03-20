
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompactStickerItemProps {
  sticker: Sticker;
  onClick: () => void;
  isRecentlyAdded?: boolean;
  transaction?: { person: string, color: string } | null;
  className?: string;
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
  transaction,
  className
}: CompactStickerItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-14 h-12 flex flex-col items-center justify-center rounded-md cursor-pointer",
        "border border-border transition-all duration-200 hover:shadow-sm",
        "relative overflow-hidden",
        "min-w-[56px] min-h-[48px]", 
        transaction ? transaction.color : sticker.isOwned ? "bg-green-50 border-green-500" : "bg-card",
        isRecentlyAdded && "border-yellow-400",
        className 
      )}
      dir="rtl" // Ensure RTL direction
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[10px] border-t-yellow-400 border-r-[10px] border-r-transparent z-10"></div>
      )}
      
      <span className={cn(
        "text-lg font-bold",
        sticker.isOwned && !transaction ? "text-green-600" : "text-foreground"
      )}>
        {sticker.number}
      </span>
      
      {(sticker.isDuplicate && sticker.isOwned) && (
        <div className="absolute top-0.5 right-0.5 bg-interactive rounded-full w-3.5 h-3.5 flex items-center justify-center">
          <span className="text-[8px] font-bold text-interactive-foreground">
            {sticker.duplicateCount && sticker.duplicateCount > 0 ? (sticker.duplicateCount + 1) : '2+'}
          </span>
        </div>
      )}
      
      {transaction && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-center py-0.5">
          <span className="text-[8px] font-medium text-white">
            {getFirstName(transaction.person)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompactStickerItem;
