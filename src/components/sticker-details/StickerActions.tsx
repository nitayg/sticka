
import { Button } from "../ui/button";
import { 
  Check, 
  Trash2, 
  ArrowLeftRight, 
  Edit, 
  Copy, 
  X,
  CheckCircle
} from "lucide-react";
import { Sticker } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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
    <div className="flex flex-wrap gap-2 justify-center">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={sticker.isOwned ? "destructive" : "default"} 
              size="icon" 
              onClick={onToggleOwned}
              className="h-9 w-9"
            >
              {sticker.isOwned ? <Trash2 className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{sticker.isOwned ? "הסר מהאוסף" : "הוסף לאוסף"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleDuplicate}
              disabled={!sticker.isOwned}
              className="h-9 w-9"
            >
              {sticker.isDuplicate ? <X className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{sticker.isDuplicate ? "הסר סימון כפול" : "סמן ככפולה"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={shareSticker}
              className="h-9 w-9"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>הצע החלפה</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={onEdit}
              className="h-9 w-9"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>ערוך מדבקה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default StickerActions;
