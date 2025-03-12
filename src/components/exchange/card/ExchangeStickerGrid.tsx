
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ExchangeStickerGridProps {
  albumId: string;
  stickerIds: string[];
  title: string;
  exchangeColor?: string;
  exchangeUserName?: string;
  onStickerClick: (number: number) => void;
  onStickerDetails: (number: number) => void;
  selectedStickerId: string | null;
  isDialogOpen: boolean;
  handleCloseDialog: () => void;
}

const ExchangeStickerGrid = ({
  albumId,
  stickerIds,
  title,
  exchangeColor,
  exchangeUserName,
  onStickerClick,
  onStickerDetails
}: ExchangeStickerGridProps) => {
  // Convert sticker IDs to numbers and ensure they're valid
  const stickerNumbers = stickerIds
    .map(id => parseInt(id))
    .filter(number => !isNaN(number));
  
  // Get stickers from the album
  const albumStickers = getStickersByAlbumId(albumId);
  
  // Find stickers that match the given numbers
  const matchedStickers = stickerNumbers.map(number => {
    const sticker = albumStickers.find(s => s.number === number);
    return {
      number,
      isOwned: sticker?.isOwned || false,
      isDuplicate: sticker?.isDuplicate || false
    };
  });
  
  if (stickerNumbers.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Badge variant="outline" className="text-xs">{stickerNumbers.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matchedStickers.map(({ number, isOwned, isDuplicate }) => (
          <div 
            key={number}
            className={cn(
              "w-9 h-9 flex items-center justify-center text-sm font-medium rounded-md cursor-pointer border",
              isOwned 
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300" 
                : "bg-card border-border",
              isDuplicate && isOwned && "ring-2 ring-yellow-400"
            )}
            onClick={() => onStickerClick(number)}
            onContextMenu={(e) => {
              e.preventDefault();
              onStickerDetails(number);
            }}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeStickerGrid;
