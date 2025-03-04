
import { RefreshCcw, FileMinus, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ViewModeToggle from "@/components/ViewModeToggle";
import ReportDropdownMenu from "./ReportDropdownMenu";
import { getStickersByAlbumId } from '@/lib/sticker-operations';
import { useToast } from "@/components/ui/use-toast";
import { useState } from 'react';

interface AlbumHeaderActionsProps {
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
}

const AlbumHeaderActions = ({
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh
}: AlbumHeaderActionsProps) => {
  const { toast } = useToast();
  const [reportFormat, setReportFormat] = useState<'numbers' | 'names'>('numbers');

  const copyMissingStickers = () => {
    if (!selectedAlbum) return;
    
    const stickers = getStickersByAlbumId(selectedAlbum);
    const missingStickers = stickers.filter(s => !s.isOwned);
    
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
    if (!selectedAlbum) return;
    
    const stickers = getStickersByAlbumId(selectedAlbum);
    const duplicateStickers = stickers.filter(s => s.isDuplicate && s.isOwned);
    
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
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCcw className="h-3.5 w-3.5" />
              <span className="sr-only">רענן</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>רענן נתונים</p>
          </TooltipContent>
        </Tooltip>
        
        <ReportDropdownMenu
          icon={FileMinus}
          label="דו״ח חוסרים"
          tooltipText="הפקת דו״ח חוסרים"
          onCopyNumbers={() => { setReportFormat('numbers'); copyMissingStickers(); }}
          onCopyNamesAndNumbers={() => { setReportFormat('names'); copyMissingStickers(); }}
          disabled={!selectedAlbum}
        />
        
        <ReportDropdownMenu
          icon={Copy}
          label="דו״ח כפולים"
          tooltipText="הפקת דו״ח כפולים"
          onCopyNumbers={() => { setReportFormat('numbers'); copyDuplicateStickers(); }}
          onCopyNamesAndNumbers={() => { setReportFormat('names'); copyDuplicateStickers(); }}
          disabled={!selectedAlbum}
        />
        
        <ViewModeToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
          showImages={showImages}
          setShowImages={setShowImages}
        />
      </TooltipProvider>
    </div>
  );
};

export default AlbumHeaderActions;
