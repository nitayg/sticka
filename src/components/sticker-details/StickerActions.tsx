
import { Button } from "../ui/button";
import { PlusCircle, XCircle, Share2, Pencil } from "lucide-react";
import { Sticker } from "@/lib/types";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";

interface StickerActionsProps {
  sticker: Sticker;
  onToggleOwned: () => void;
  onToggleDuplicate: () => void;
  onEdit: () => void;
}

const StickerActions = ({ sticker, onToggleOwned, onToggleDuplicate, onEdit }: StickerActionsProps) => {
  const { toast } = useToast();
  
  const shareSticker = () => {
    // בעתיד - כאן יהיה קוד להצעת החלפה
    toast({
      title: "הצעת החלפה",
      description: "פונקציונליות זו תהיה זמינה בקרוב",
    });
  };

  return (
    <div className="space-y-1">
      <Label className="text-base font-medium">פעולות</Label>
      <div className="grid grid-cols-2 gap-2">
        <Button variant={sticker.isOwned ? "destructive" : "default"} onClick={onToggleOwned}>
          {sticker.isOwned ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              הסר מהאוסף
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              הוסף לאוסף
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onToggleDuplicate}
          disabled={!sticker.isOwned}
        >
          {sticker.isDuplicate ? "הסר סימון כפול" : "סמן ככפולה"}
        </Button>
        
        <Button variant="secondary" onClick={shareSticker}>
          <Share2 className="h-4 w-4 mr-2" />
          הצע החלפה
        </Button>
        
        <Button variant="secondary" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          ערוך מדבקה
        </Button>
      </div>
    </div>
  );
};

export default StickerActions;
