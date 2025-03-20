
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import CompactCard from "./sticker-card/CompactCard";
import DetailCard from "./sticker-card/DetailCard";

interface StickerCardProps {
  sticker: Sticker;
  compact?: boolean;
  showActions?: boolean;
  showAlbumInfo?: boolean;
  showImages?: boolean;
  onClick?: () => void;
  className?: string;
  transaction?: { person: string, color: string };
  isRecentlyAdded?: boolean;
}

const StickerCard = ({ 
  sticker, 
  compact = false, 
  showActions = false,
  showAlbumInfo = false,
  showImages = true,
  onClick, 
  className,
  transaction,
  isRecentlyAdded = false
}: StickerCardProps) => {
  // For the card view (when compact = true), we'll use the CompactCard component
  if (compact) {
    return (
      <CompactCard
        sticker={sticker}
        onClick={onClick}
        showImages={showImages}
        showAlbumInfo={showAlbumInfo}
        transaction={transaction}
        isRecentlyAdded={isRecentlyAdded}
        className={className}
      />
    );
  }
  
  // For the detailed view, use the DetailCard component
  return (
    <DetailCard
      sticker={sticker}
      showActions={showActions}
      showAlbumInfo={showAlbumInfo}
      showImages={showImages}
      onClick={onClick}
      className={className}
      transaction={transaction}
      isRecentlyAdded={isRecentlyAdded}
    />
  );
};

export default StickerCard;
