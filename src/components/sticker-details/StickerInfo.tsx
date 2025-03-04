
import { Sticker } from "@/lib/types";
import { Badge } from "../ui/badge";

interface StickerInfoProps {
  sticker: Sticker;
}

const StickerInfo = ({ sticker }: StickerInfoProps) => {
  return (
    <div className="bg-secondary/70 backdrop-blur-sm rounded-lg p-3 space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <InfoItem label="מספר" value={sticker.number.toString()} />
        <InfoItem label="שם" value={sticker.name} />
        <InfoItem label="קבוצה" value={sticker.team} />
        <InfoItem label="קטגוריה" value={sticker.category} />
        
        <div className="col-span-2 flex items-center justify-between border-t border-border/40 pt-2 mt-1">
          <span className="text-xs text-muted-foreground">סטטוס:</span>
          <Badge variant={sticker.isOwned ? "success" : "outline"} className="font-medium">
            {sticker.isOwned ? "נאספה" : "חסרה"}
          </Badge>
        </div>

        {sticker.isOwned && (
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">כפולה:</span>
            <Badge variant={sticker.isDuplicate ? "warning" : "outline"} className="font-medium">
              {sticker.isDuplicate ? 
                (sticker.duplicateCount && sticker.duplicateCount > 0 ? 
                  `כן (${sticker.duplicateCount + 1})` : 
                  'כן') : 
                'לא'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

// תת-רכיב ליצירת שורת מידע עקבית
const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{label}:</span>
    <span className="font-medium truncate">{value}</span>
  </div>
);

export default StickerInfo;
