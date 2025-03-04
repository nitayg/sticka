
import { useState } from 'react';
import { Plus, History, RefreshCcw, FileMinus, FileCopy, ClipboardCopy, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { Album } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStickersByAlbumId } from '@/lib/sticker-operations';
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: string;
  setViewMode: (mode: string) => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
}

const AlbumHeader = ({
  albums,
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  onImportComplete
}: AlbumHeaderProps) => {
  const { toast } = useToast();
  const [reportFormat, setReportFormat] = useState<'numbers' | 'names'>('numbers');
  
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);
  
  // Copy missing stickers to clipboard
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
  
  // Copy duplicate stickers to clipboard
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
    <div className="pb-2 mb-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold truncate">
            {selectedAlbumData ? selectedAlbumData.name : 'טוען...'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {selectedAlbumData?.description || 'בחר אלבום כדי להציג את המדבקות שלו'}
          </p>
        </div>
        
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
            
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex gap-1.5"
                      disabled={!selectedAlbum}
                    >
                      <FileMinus className="h-3.5 w-3.5" />
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex gap-1.5"
                      disabled={!selectedAlbum}
                    >
                      <FileCopy className="h-3.5 w-3.5" />
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
            
            <ViewModeToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              showImages={showImages}
              setShowImages={setShowImages}
            />
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;

