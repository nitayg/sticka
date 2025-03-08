
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
      </div>
    </div>
  );
};

export default CompactStickerItem;
