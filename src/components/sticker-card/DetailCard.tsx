
import { Sticker } from "@/lib/types";
import { cn } from "@/lib/utils";
import StickerImage from "../sticker-details/StickerImage";
import StickerActions from "../sticker-details/StickerActions";
import { updateSticker } from "@/lib/sticker-operations";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

interface DetailCardProps {
  sticker: Sticker & { albumName?: string };
  showActions?: boolean;
  showAlbumInfo?: boolean;
  showImages?: boolean;
  onClick?: () => void;
  className?: string;
  transaction?: { person: string, color: string } | null;
  isRecentlyAdded?: boolean;
}

const DetailCard = ({
  sticker,
  showActions = false,
  showAlbumInfo = false,
  showImages = true,
  onClick,
  className,
  transaction,
  isRecentlyAdded = false
}: DetailCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleOwned = async () => {
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        isOwned: !sticker.isOwned,
        // If we're marking as not owned, also remove duplicate status
        ...(sticker.isOwned ? { isDuplicate: false } : {})
      });
      
      toast({
        title: sticker.isOwned ? "המדבקה סומנה כחסרה" : "המדבקה סומנה כנאספה",
        description: sticker.isOwned 
          ? `מדבקה ${sticker.number} הוסרה מהאוסף שלך` 
          : `מדבקה ${sticker.number} נוספה לאוסף שלך`,
      });
      
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    } catch (error) {
      console.error("Error updating sticker:", error);
      toast({
        title: "שגיאה בעדכון המדבקה",
        description: "אירעה שגיאה בעת עדכון המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDuplicate = async () => {
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        isDuplicate: !sticker.isDuplicate
      });
      
      toast({
        title: sticker.isDuplicate ? "המדבקה סומנה כיחידה" : "המדבקה סומנה ככפולה",
        description: sticker.isDuplicate 
          ? `מדבקה ${sticker.number} סומנה כיחידה` 
          : `מדבקה ${sticker.number} סומנה ככפולה`,
      });
      
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    } catch (error) {
      console.error("Error updating sticker:", error);
      toast({
        title: "שגיאה בעדכון המדבקה",
        description: "אירעה שגיאה בעת עדכון המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-lg border overflow-hidden",
        transaction ? transaction.color : sticker.isOwned ? "bg-green-50 border-green-300" : "bg-card border-border",
        isRecentlyAdded && "border-yellow-400",
        className
      )}
      dir="rtl"
    >
      <div className="p-4">
        <div className="flex mb-3 items-start">
          {showImages && (
            <div className="w-16 h-16 mr-3 flex-shrink-0 mb-auto">
              <StickerImage
                imageUrl={sticker.imageUrl}
                fallbackImage={sticker.teamLogo}
                alt={sticker.name || `Sticker ${sticker.number}`}
                stickerNumber={sticker.number}
                showImage={showImages}
                isOwned={sticker.isOwned}
                isDuplicate={sticker.isDuplicate}
                duplicateCount={sticker.duplicateCount}
                inTransaction={!!transaction}
                transactionColor={transaction?.color}
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-semibold">{sticker.name || `מספר ${sticker.number}`}</h3>
              <span className="text-sm font-medium bg-secondary/50 px-2 py-0.5 rounded-md ml-1">
                #{sticker.number}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-1">
              {sticker.team}
              {showAlbumInfo && sticker.albumName && (
                <span className="mr-1">({sticker.albumName})</span>
              )}
            </div>
            
            {sticker.category && (
              <div className="text-xs text-muted-foreground">
                קטגוריה: {sticker.category}
              </div>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="mt-3">
            <StickerActions
              sticker={sticker}
              onToggleOwned={handleToggleOwned}
              onToggleDuplicate={handleToggleDuplicate}
              onEdit={onClick || (() => {})}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailCard;
