
import { Button } from "../ui/button";
import { 
  PlusCircle, 
  XCircle, 
  Share2, 
  Pencil, 
  Copy, 
  AlertCircle,
  Check 
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
    <div className="space-y-1">
      <TooltipProvider>
        <div className="flex gap-2 flex-wrap justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={sticker.isOwned ? "destructive" : "default"} 
                size="icon" 
                onClick={onToggleOwned}
              >
                {sticker.isOwned ? <XCircle /> : <Check />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
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
              >
                {sticker.isDuplicate ? <AlertCircle /> : <Copy />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sticker.isDuplicate ? "הסר סימון כפול" : "סמן ככפולה"}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={shareSticker}
              >
                <Share2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>הצע החלפה</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onEdit}
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>ערוך מדבקה</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default StickerActions;
