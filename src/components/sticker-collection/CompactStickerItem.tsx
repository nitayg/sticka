
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompactStickerItemProps {
  sticker: Sticker;
  onClick: () => void;
  isRecentlyAdded?: boolean;
  transaction?: { person: string, color: string } | null;
  className?: string; // Add className to the interface
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
        "w-14 h-14 flex flex-col items-center justify-center rounded-md cursor-pointer",
        "border border-border transition-all duration-200 hover:shadow-sm",
        "relative overflow-hidden",
        "min-w-[56px] min-h-[56px] mb-2", // Increased margin-bottom from 1 to 2 (from 0.25rem to 0.5rem)
        transaction ? transaction.color : "bg-card",
        isRecentlyAdded && "border-yellow-400",
        className // Add className to the className list
      )}
    >
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[10px] border-t-yellow-400 border-r-[10px] border-r-transparent z-10"></div>
      )}
      
      <span className="text-lg font-bold text-foreground">
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
