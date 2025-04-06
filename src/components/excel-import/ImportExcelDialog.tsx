
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Album } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AlbumSelectField from "./AlbumSelectField";
import FileUploadField from "./FileUploadField";
import ImportProgressIndicator from "./ImportProgressIndicator";
import { useExcelImport } from "./useExcelImport";

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
  
  const {
    file,
    setFile,
    parsedData,
    handleFileUpload,
    isImporting,
    importProgress,
    importResult,
    errorMessage,
    handleImport,
    resetImportState
  } = useExcelImport({
    selectedAlbum,
    onImportComplete: () => {
      // Only close the dialog if import was successful
      if (importResult && importResult.success) {
        setTimeout(() => {
          setOpen(false);
          onImportComplete();
          // Reset the state after dialog is closed
          setTimeout(() => resetImportState(), 300);
        }, 1500); // Delay to show 100% completion
      }
    }
  });
  
  // Handle dialog close - reset import state
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    
    // Reset import state when dialog is closed
    if (!newOpen && !isImporting) {
      resetImportState();
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            disabled={isImporting}
          />
          
          {isImporting && (
            <ImportProgressIndicator 
              value={importProgress} 
              status={importProgress >= 100 ? "complete" : "importing"} 
            />
          )}
          
          {errorMessage && !isImporting && (
            <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
              {errorMessage}
            </div>
          )}
          
          {importResult && importResult.success && !isImporting && (
            <div className="bg-green-100 p-3 rounded-md text-green-800 text-sm">
              יובאו {importResult.importedCount} מדבקות בהצלחה
            </div>
          )}
          
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
