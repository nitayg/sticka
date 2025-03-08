
import { Sticker } from "@/lib/types";
import StickerImage from "../sticker-details/StickerImage";

interface CompactStickerItemProps {
  sticker: Sticker;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const CompactStickerItem = ({ 
  sticker, 
  transaction, 
  isRecentlyAdded = false, 
  onClick,
  isSelected,
  onSelect
}: CompactStickerItemProps) => {
  return (
    <div 
      onClick={onSelect || onClick} 
      className={`cursor-pointer rounded-md overflow-hidden sticker-shadow transition-all duration-200 hover:translate-y-[-2px] ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="relative aspect-square">
        <StickerImage
          alt={sticker.name}
          stickerNumber={sticker.number}
          isOwned={sticker.isOwned}
          isDuplicate={sticker.isDuplicate}
          duplicateCount={sticker.duplicateCount}
          inTransaction={!!transaction}
          transactionColor={transaction?.color}
          transactionPerson={transaction?.person}
          compactView={true}
          isRecentlyAdded={isRecentlyAdded}
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-1 px-2">
          <div className="text-white text-center text-xs">
            #{sticker.number}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactStickerItem;
