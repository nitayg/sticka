
import { Sticker } from '@/lib/types';
import { cn } from '@/lib/utils';
import StickerCard from '@/components/StickerCard';
import CompactStickerItem from './CompactStickerItem';
import StickerListItem from '@/components/StickerListItem';

interface StickerCollectionGridProps {
  stickers: Sticker[];
  viewMode: 'grid' | 'list' | 'compact';
  showImages: boolean;
  onStickerClick: (sticker: Sticker) => void;
  selectedStickers?: Set<string>;
  onStickerSelect?: (sticker: Sticker) => void;
  isSelectionMode?: boolean;
  transactionMap?: Record<string, string[]>;
}

const StickerCollectionGrid = ({
  stickers,
  viewMode,
  showImages,
  onStickerClick,
  selectedStickers,
  onStickerSelect,
  isSelectionMode = false,
  transactionMap = {}
}: StickerCollectionGridProps) => {
  if (!stickers || stickers.length === 0) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground">
        לא נמצאו מדבקות
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="divide-y divide-border">
        {stickers.map((sticker) => (
          <StickerListItem
            key={sticker.id}
            sticker={sticker}
            onClick={() => onStickerClick(sticker)}
            showImage={showImages}
            isSelected={selectedStickers?.has(sticker.id)}
            onSelect={isSelectionMode && onStickerSelect ? () => onStickerSelect(sticker) : undefined}
            transactions={transactionMap[sticker.id] || []}
          />
        ))}
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {stickers.map((sticker) => (
          <CompactStickerItem
            key={sticker.id}
            sticker={sticker}
            onClick={() => onStickerClick(sticker)}
            isSelected={selectedStickers?.has(sticker.id)}
            onSelect={isSelectionMode && onStickerSelect ? () => onStickerSelect(sticker) : undefined}
            transactions={transactionMap[sticker.id] || []}
          />
        ))}
      </div>
    );
  }

  // Facebook-style grid (stories-like)
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pb-4">
      {stickers.map((sticker) => (
        <div key={sticker.id} className="aspect-square">
          <div 
            className={cn(
              "h-full w-full relative rounded-lg overflow-hidden cursor-pointer border border-gray-800 transition-transform hover:scale-[1.02]",
              selectedStickers?.has(sticker.id) && "ring-2 ring-blue-500"
            )}
            onClick={() => isSelectionMode && onStickerSelect ? onStickerSelect(sticker) : onStickerClick(sticker)}
          >
            {showImages && sticker.imageUrl ? (
              <img 
                src={sticker.imageUrl} 
                alt={sticker.name || `מדבקה ${sticker.number}`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-900">
                <span className="text-lg font-semibold">{sticker.number}</span>
              </div>
            )}
            
            {/* Status indicators */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="text-xs text-white text-center">
                {sticker.name || `#${sticker.number}`}
              </div>
            </div>
            
            {sticker.isOwned && (
              <div className="absolute top-1 right-1 h-3 w-3 bg-green-500 rounded-full"></div>
            )}
            
            {sticker.isDuplicate && (
              <div className="absolute top-1 left-1 h-3 w-3 bg-blue-500 rounded-full"></div>
            )}
            
            {(transactionMap[sticker.id]?.length > 0) && (
              <div className="absolute top-1 left-1 h-3 w-3 bg-orange-500 rounded-full"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StickerCollectionGrid;
