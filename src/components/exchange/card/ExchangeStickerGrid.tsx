
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import StickerImage from "../../sticker-details/StickerImage";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

// Helper function to get first name only
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

interface ExchangeStickerGridProps {
  albumId: string;
  stickerIds: string[];
  title: string;
  exchangeColor: string | undefined;
  exchangeUserName: string;
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
  onStickerDetails,
  selectedStickerId,
  isDialogOpen,
  handleCloseDialog
}: ExchangeStickerGridProps) => {
  const albumStickers = getStickersByAlbumId(albumId);
  const stickerNumbers = stickerIds.map(id => parseInt(id));
  
  // Find actual sticker objects by number
  const getActualStickerByNumber = (number: number) => {
    return albumStickers.find(sticker => sticker.number === number);
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-8 gap-2">
        {stickerNumbers.map(stickerId => {
          const actualSticker = getActualStickerByNumber(stickerId);
          return (
            <Dialog 
              key={`${title}-${stickerId}`} 
              open={isDialogOpen && selectedStickerId === actualSticker?.id} 
              onOpenChange={(open) => !open && handleCloseDialog()}
            >
              <DialogTrigger asChild>
                <div 
                  onClick={() => onStickerDetails(stickerId)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onStickerClick(stickerId);
                  }}
                  className="cursor-pointer"
                >
                  <StickerImage
                    alt={`מדבקה ${stickerId}`}
                    stickerNumber={stickerId}
                    compactView={true}
                    inTransaction={true}
                    transactionColor={exchangeColor}
                    transactionPerson={getFirstName(exchangeUserName)}
                    isOwned={actualSticker?.isOwned}
                    isDuplicate={actualSticker?.isDuplicate}
                    duplicateCount={actualSticker?.duplicateCount}
                  />
                </div>
              </DialogTrigger>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeStickerGrid;
