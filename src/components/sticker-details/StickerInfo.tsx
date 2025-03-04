
import { Sticker } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface StickerInfoProps {
  sticker: Sticker;
}

const StickerInfo = ({ sticker }: StickerInfoProps) => {
  return (
    <div className="bg-secondary/40 backdrop-blur-sm rounded-lg p-4 space-y-3 text-sm shadow-sm border border-border/20">
      <div className="grid grid-cols-2 gap-3">
        <InfoItem 
          label="מספר" 
          value={sticker.number.toString()} 
          tooltip="המספר הסידורי של המדבקה"
        />
        <InfoItem 
          label="שם" 
          value={sticker.name} 
          tooltip="שם המדבקה"
        />
        <InfoItem 
          label="קבוצה" 
          value={sticker.team} 
          tooltip="הקבוצה אליה משתייכת המדבקה"
        />
        <InfoItem 
          label="קטגוריה" 
          value={sticker.category} 
          tooltip="קטגוריית המדבקה"
        />
        
        <div className="col-span-2 flex items-center justify-between border-t border-border/30 pt-3 mt-1">
          <span className="text-xs text-muted-foreground font-medium">סטטוס:</span>
          <Badge 
            variant={sticker.isOwned ? "success" : "outline"} 
            className="font-medium px-3 py-1"
          >
            {sticker.isOwned ? "נאספה" : "חסרה"}
          </Badge>
        </div>

        {sticker.isOwned && (
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">כפולה:</span>
            <Badge 
              variant={sticker.isDuplicate ? "warning" : "outline"} 
              className="font-medium px-3 py-1"
            >
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

// תת-רכיב ליצירת שורת מידע עקבית עם טולטיפ
const InfoItem = ({ 
  label, 
  value, 
  tooltip 
}: { 
  label: string, 
  value: string, 
  tooltip?: string 
}) => (
  <div className="flex flex-col">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-muted-foreground font-medium cursor-help">{label}:</span>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent side="top">
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
    <span className="font-medium truncate text-foreground">{value}</span>
  </div>
);

export default StickerInfo;
