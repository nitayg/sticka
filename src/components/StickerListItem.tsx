
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StickerListItemProps {
  sticker: Sticker;
  onClick?: () => void;
}

const StickerListItem = ({ sticker, onClick }: StickerListItemProps) => {
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
        <img 
          src={sticker.imageUrl} 
          alt={sticker.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">#{sticker.number} • {sticker.team}</p>
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
