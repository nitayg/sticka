
// Update ImportExcelDialog to support iconOnly mode

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Album } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AlbumSelectField from "./excel-import/AlbumSelectField";
import FileUploadField from "./excel-import/FileUploadField";
import { useToast } from "@/components/ui/use-toast";
import { importStickersFromCSV } from "@/lib/sticker-operations";

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
  const { toast } = useToast();
  
  const handleImport = async () => {
    if (!selectedAlbum) {
      toast({
        title: "לא נבחר אלבום",
        description: "יש לבחור אלבום לפני ייבוא מדבקות",
        variant: "destructive",
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "לא נבחר קובץ",
        description: "יש לבחור קובץ אקסל לייבוא",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Parse Excel file and convert to the format expected by importStickersFromCSV
      // This is a placeholder - the actual implementation would depend on how your Excel import works
      const csvData: [number, string, string][] = [[1, "Example Sticker", "Team"]]; 
      
      const result = await importStickersFromCSV(selectedAlbum, csvData);
      
      setOpen(false);
      setFile(null);
      
      toast({
        title: "ייבוא הושלם בהצלחה",
        description: `יובאו ${result.length} מדבקות בהצלחה`,
      });
      
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
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10 rounded-full bg-gray-800"
    >
      <FileSpreadsheet className="h-5 w-5" />
    </Button>
  ) : (
    <Button variant="outline" size="sm">
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
          />
          
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !file || !selectedAlbum}
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
