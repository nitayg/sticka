
import { Sticker } from "@/lib/types";
import { Label } from "../ui/label";

interface StickerInfoProps {
  sticker: Sticker;
}

const StickerInfo = ({ sticker }: StickerInfoProps) => {
  return (
    <div>
      <div className="bg-secondary rounded-md p-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">מספר:</span>
          <span className="font-medium">{sticker.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">שם:</span>
          <span className="font-medium">{sticker.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">קבוצה:</span>
          <span className="font-medium">{sticker.team}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">קטגוריה:</span>
          <span className="font-medium">{sticker.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">סטטוס:</span>
          <span className="font-medium">{sticker.isOwned ? "נאספה" : "חסרה"}</span>
        </div>
        {sticker.isOwned && (
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">כפולה:</span>
            <span className="font-medium">
              {sticker.isDuplicate ? 
                (sticker.duplicateCount && sticker.duplicateCount > 0 ? 
                  `כן (${sticker.duplicateCount + 1})` : 
                  'כן') : 
                'לא'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerInfo;
