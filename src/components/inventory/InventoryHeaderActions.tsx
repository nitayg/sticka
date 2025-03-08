
import React from "react";
import { History, FileMinus, Copy, ClipboardCopy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryHeaderActionsProps {
  onAddClick: () => void;
  albumStickers: any[];
  reportFormat: 'numbers' | 'names';
  setReportFormat: (format: 'numbers' | 'names') => void;
}

const InventoryHeaderActions = ({
  onAddClick,
  albumStickers,
  reportFormat,
  setReportFormat
}: InventoryHeaderActionsProps) => {
  const { toast } = useToast();

  const copyMissingStickers = () => {
    const missingStickers = albumStickers.filter(s => !s.isOwned);
    
    let clipboardText = '';
    if (reportFormat === 'numbers') {
      clipboardText = missingStickers.map(s => s.number).join(', ');
    } else {
      clipboardText = missingStickers.map(s => `${s.number} - ${s.name || 'ללא שם'}`).join('\n');
    }
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText);
      toast({
        title: "דו״ח חוסרים הועתק",
        description: `${missingStickers.length} מדבקות חסרות הועתקו ללוח`,
      });
    } else {
      toast({
        title: "אין מדבקות חסרות",
        description: "לא נמצאו מדבקות חסרות להעתקה",
      });
    }
  };
  
  const copyDuplicateStickers = () => {
    const duplicateStickers = albumStickers.filter(s => s.isDuplicate && s.isOwned);
    
    let clipboardText = '';
    if (reportFormat === 'numbers') {
      clipboardText = duplicateStickers.map(s => s.number).join(', ');
    } else {
      clipboardText = duplicateStickers.map(s => {
        const count = s.duplicateCount || 1;
        return `${s.number} - ${s.name || 'ללא שם'} (${count} כפולים)`;
      }).join('\n');
    }
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText);
      toast({
        title: "דו״ח כפולים הועתק",
        description: `${duplicateStickers.length} מדבקות כפולות הועתקו ללוח`,
      });
    } else {
      toast({
        title: "אין מדבקות כפולות",
        description: "לא נמצאו מדבקות כפולות להעתקה",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={onAddClick}
        className="px-2 py-1.5 h-8 text-xs rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground font-medium transition-colors flex items-center gap-1"
      >
        <Plus className="h-3.5 w-3.5 ml-1" />
        הוספה
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5 ml-1" />
                  <span className="sr-only md:not-sr-only md:inline-block">דו״ח כפולים</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setReportFormat('numbers'); copyDuplicateStickers(); }}>
                  <ClipboardCopy className="h-4 w-4 ml-2" />
                  העתק מספרים (1, 2, 3)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setReportFormat('names'); copyDuplicateStickers(); }}>
                  <Copy className="h-4 w-4 ml-2" />
                  העתק מספרים ושמות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>הפקת דו״ח כפולים</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex gap-1.5"
                >
                  <FileMinus className="h-3.5 w-3.5 ml-1" />
                  <span className="sr-only md:not-sr-only md:inline-block">דו״ח חוסרים</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setReportFormat('numbers'); copyMissingStickers(); }}>
                  <ClipboardCopy className="h-4 w-4 ml-2" />
                  העתק מספרים (1, 2, 3)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setReportFormat('names'); copyMissingStickers(); }}>
                  <Copy className="h-4 w-4 ml-2" />
                  העתק מספרים ושמות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>הפקת דו״ח חוסרים</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              size="sm"
              asChild
            >
              <Link to="/inventory/history" className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 ml-1" />
                היסטוריה
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>היסטוריית קליטת מדבקות</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default InventoryHeaderActions;
