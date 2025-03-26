
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ExchangeOffer } from "@/lib/types";
import { toggleStickerOwned } from "@/lib/sticker-operations";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import StickerDetailsDialog from "@/components/StickerDetailsDialog";
import { getStickersByAlbumId } from "@/lib/sticker-operations";

import ExchangeHeader from "./ExchangeHeader";
import ExchangeContactInfo from "./ExchangeContactInfo";
import ExchangeStickerGrid from "./ExchangeStickerGrid";
import ExchangeActions from "./ExchangeActions";

interface ExchangeCardProps {
  exchange: ExchangeOffer;
  onRefresh?: () => void;
  isOwner?: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const ExchangeCard = ({ 
  exchange, 
  onRefresh,
  isOwner,
  onUpdate,
  onDelete,
  onComplete
}: ExchangeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const albumStickers = getStickersByAlbumId(exchange.albumId);
  
  // Find actual sticker objects by number
  const getActualStickerByNumber = (number: number) => {
    return albumStickers.find(sticker => sticker.number === number);
  };
  
  // Handle sticker click (toggle owned status)
  const handleStickerClick = (number: number) => {
    const actualSticker = getActualStickerByNumber(number);
    if (actualSticker) {
      toggleStickerOwned(actualSticker.id);
      
      // Update cache with new sticker data
      queryClient.invalidateQueries({ 
        queryKey: ['stickers', exchange.albumId] 
      });
      
      toast({
        title: actualSticker.isOwned ? "מדבקה הוסרה מהמלאי" : "מדבקה נוספה למלאי",
        description: `מדבקה #${number} ${actualSticker.isOwned ? "הוסרה מ" : "נוספה ל"}מלאי שלך.`,
      });
      
      // Notify all components about the inventory change
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
      
      if (onRefresh) {
        onRefresh();
      }
    }
  };
  
  // Open sticker details dialog
  const handleStickerDetails = (number: number) => {
    const actualSticker = getActualStickerByNumber(number);
    if (actualSticker) {
      setSelectedSticker(actualSticker);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSticker(null);
  };

  // Ensure wantedStickerId and offeredStickerId are arrays
  const wantedStickerIds = Array.isArray(exchange.wantedStickerId) 
    ? exchange.wantedStickerId 
    : [exchange.wantedStickerId].filter(Boolean);
    
  const offeredStickerIds = Array.isArray(exchange.offeredStickerId) 
    ? exchange.offeredStickerId 
    : [exchange.offeredStickerId].filter(Boolean);

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border border-border hover:shadow-lg transition-all",
        exchange.color || "bg-card"
      )}
    >
      <ExchangeHeader 
        exchange={exchange} 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
      />
      
      <ExchangeContactInfo exchange={exchange} />
      
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-border/40 mt-3">
          <ExchangeStickerGrid
            albumId={exchange.albumId}
            stickerIds={wantedStickerIds}
            title="מקבל"
            exchangeColor={exchange.color}
            exchangeUserName={exchange.userName}
            onStickerClick={handleStickerClick}
            onStickerDetails={handleStickerDetails}
            selectedStickerId={selectedSticker?.id || null}
            isDialogOpen={isDialogOpen}
            handleCloseDialog={handleCloseDialog}
          />
          
          <ExchangeStickerGrid
            albumId={exchange.albumId}
            stickerIds={offeredStickerIds}
            title="נותן"
            exchangeColor={exchange.color}
            exchangeUserName={exchange.userName}
            onStickerClick={handleStickerClick}
            onStickerDetails={handleStickerDetails}
            selectedStickerId={selectedSticker?.id || null}
            isDialogOpen={isDialogOpen}
            handleCloseDialog={handleCloseDialog}
          />
        </div>
      )}

      {selectedSticker && (
        <StickerDetailsDialog
          sticker={selectedSticker}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onUpdate={() => {
            queryClient.invalidateQueries({ 
              queryKey: ['stickers', exchange.albumId] 
            });
            
            if (onRefresh) onRefresh();
            window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
            window.dispatchEvent(new CustomEvent('albumDataChanged'));
            handleCloseDialog();
          }}
        />
      )}
      
      <ExchangeActions 
        exchange={exchange}
        onRefresh={onRefresh || (() => {})}
        isOwner={isOwner}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onComplete={onComplete}
      />
    </div>
  );
};

export default ExchangeCard;
