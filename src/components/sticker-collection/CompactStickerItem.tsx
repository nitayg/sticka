
import { Sticker } from "@/lib/types";
import StickerImage from "../sticker-details/StickerImage";

interface CompactStickerItemProps {
  sticker: Sticker;
  transaction?: { person: string, color: string };
  isRecentlyAdded: boolean;
  onClick: () => void;
}

const CompactStickerItem = ({ 
  sticker, 
  transaction, 
  isRecentlyAdded, 
  onClick 
}: CompactStickerItemProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
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
  );
};

export default CompactStickerItem;
