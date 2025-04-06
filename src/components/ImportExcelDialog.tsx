
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Album } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AlbumSelectField from "./excel-import/AlbumSelectField";
import FileUploadField from "./excel-import/FileUploadField";
import { useToast } from "@/components/ui/use-toast";
import { importStickersFromCSV } from "@/lib/sticker-operations";
import { parseCSV, ParsedCsvRow } from "@/utils/csv-parser";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (id: string) => void;
  onImportComplete: () => void;
  iconOnly?: boolean;
}

const ImportExcelDialog = ({ 
  albums, 
  selectedAlbum, 
  setSelectedAlbum,
  onImportComplete,
  iconOnly = false
}: ImportExcelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[]>([]);
  const { toast } = useToast();
  
  const handleFileUpload = (data: ParsedCsvRow[]) => {
    setParsedData(data);
    
    // Check if we have critical range stickers (426-440)
    const criticalRangeStickers = data.filter(row => {
      if (typeof row.number === 'number') {
        return row.number >= 426 && row.number <= 440;
      }
      return false;
    });
    
    if (criticalRangeStickers.length > 0) {
      console.log(`File upload contains ${criticalRangeStickers.length} stickers in range 426-440:`, criticalRangeStickers);
    }
  };
  
  const handleImport = async () => {
    if (!selectedAlbum) {
      toast({
        title: "לא נבחר אלבום",
        description: "יש לבחור אלבום לפני ייבוא מדבקות",
        variant: "destructive",
      });
      return;
    }
    
    if (!file && parsedData.length === 0) {
      toast({
        title: "לא נבחר קובץ",
        description: "יש לבחור קובץ אקסל או CSV לייבוא",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      let dataToImport: [number | string, string, string][] = [];
      
      if (parsedData.length > 0) {
        dataToImport = parsedData.map(row => {
          const isAlphanumeric = typeof row.number === 'string' && /[^0-9]/.test(row.number);
          const number = isAlphanumeric ? row.number : 
                        (typeof row.number === 'number' ? row.number : 
                         parseInt(String(row.number), 10));
          return [number, row.name, row.team];
        });
      } 
      else if (file) {
        const fileContent = await file.text();
        const parsed = parseCSV(fileContent);
        dataToImport = parsed.map(row => {
          const isAlphanumeric = typeof row.number === 'string' && /[^0-9]/.test(row.number);
          const number = isAlphanumeric ? row.number : 
                        (typeof row.number === 'number' ? row.number : 
                         parseInt(String(row.number), 10));
          return [number, row.name, row.team];
        });
      }
      
      if (dataToImport.length === 0) {
        throw new Error("לא נמצאו מדבקות בקובץ");
      }
      
      // Check if we have any stickers in the critical range
      const criticalRangeItems = dataToImport.filter(([num]) => {
        if (typeof num === 'number') {
          return num >= 426 && num <= 440;
        }
        return false;
      });
      
      if (criticalRangeItems.length > 0) {
        console.log(`Import data contains ${criticalRangeItems.length} stickers in range 426-440:`, criticalRangeItems);
      }
      
      console.log("Importing data:", dataToImport);
      const result = await importStickersFromCSV(selectedAlbum, dataToImport);
      console.log("Import result:", result);
      
      if (!result || result.length === 0) {
        throw new Error("שגיאה בייבוא המדבקות לשרת");
      }
      
      // Check if the critical range stickers were successfully imported
      const importedCriticalRange = result.filter(s => {
        if (typeof s.number === 'number') {
          return s.number >= 426 && s.number <= 440;
        }
        return false;
      });
      
      if (criticalRangeItems.length > 0 && importedCriticalRange.length === 0) {
        console.warn("Warning: Critical range stickers (426-440) were not imported successfully.");
        toast({
          title: "חלק מהמדבקות לא יובאו",
          description: "מדבקות בטווח 426-440 לא יובאו בהצלחה. אנא נסה שוב.",
          variant: "warning",
        });
      }
      
      setOpen(false);
      setFile(null);
      setParsedData([]);
      
      toast({
        title: "ייבוא הושלם בהצלחה",
        description: `יובאו ${result.length} מדבקות בהצלחה`,
      });
      
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId: selectedAlbum, action: 'import', count: result.length } 
      }));
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      onImportComplete();
    } catch (error) {
      console.error("Error importing Excel:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת ייבוא המדבקות",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const trigger = iconOnly ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="secondary" 
            size="sm"
            className="flex gap-1.5"
            onClick={() => setOpen(true)}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 ml-1" />
            <span className="sr-only md:not-sr-only md:inline-block">יבא מאקסל</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>יבוא מדבקות מאקסל</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
      <FileSpreadsheet className="h-4 w-4 ml-2" />
      יבא מאקסל
    </Button>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>יבוא מדבקות מאקסל</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <AlbumSelectField
            albums={albums}
            selectedAlbum={selectedAlbum}
            setSelectedAlbum={setSelectedAlbum}
          />
          
          <FileUploadField
            file={file}
            setFile={setFile}
            onParse={handleFileUpload}
          />
          
          <Button 
            onClick={handleImport} 
            disabled={isImporting || (!file && parsedData.length === 0) || !selectedAlbum}
            className="bg-interactive hover:bg-interactive-hover text-interactive-foreground"
          >
            {isImporting ? "מייבא..." : "ייבא מדבקות"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelDialog;
