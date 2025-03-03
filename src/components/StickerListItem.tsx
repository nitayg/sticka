
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Image, Shield } from "lucide-react";

interface StickerListItemProps {
  sticker: Sticker;
  showImages?: boolean;
  onClick?: () => void;
}

const StickerListItem = ({ sticker, showImages = true, onClick }: StickerListItemProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center space-x-4 p-3 rounded-xl bg-white border border-border",
        "transition-all duration-300 ease-out hover:shadow-md",
        onClick && "cursor-pointer"
      )}
    >
      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
        {showImages ? (
          <img 
            src={sticker.imageUrl} 
            alt={sticker.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Image className="h-4 w-4 text-muted-foreground mb-0.5 opacity-40" />
            <div className="text-sm font-bold">{sticker.number}</div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <span>#{sticker.number}</span>
          <span className="mx-1">•</span>
          {sticker.teamLogo ? (
            <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain ml-1" />
          ) : (
            <Shield className="w-3 h-3 opacity-50 ml-1" />
          )}
          <span>{sticker.team}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground truncate">{sticker.name}</h3>
        <p className="text-sm text-muted-foreground">{sticker.category}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {sticker.isDuplicate && sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            כפול
          </div>
        )}
        {!sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            חסר
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerListItem;
