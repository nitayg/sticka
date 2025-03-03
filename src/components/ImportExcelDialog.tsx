
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { FileInput } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Album, importStickersFromCSV } from "@/lib/data";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import NewTeamsLogoDialog from "./NewTeamsLogoDialog";
import FileUploadField from "./excel-import/FileUploadField";
import AlbumSelectField from "./excel-import/AlbumSelectField";
import { CSVData, parseCSVContent, readFileAsText } from "@/utils/csv-parser";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
  onImportComplete?: () => void;
}

const ImportExcelDialog = ({ albums, selectedAlbum, setSelectedAlbum, onImportComplete }: ImportExcelDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For new teams logo dialog
  const [newTeams, setNewTeams] = useState<string[]>([]);
  const [showNewTeamsDialog, setShowNewTeamsDialog] = useState(false);
  const [parsedData, setParsedData] = useState<CSVData>([]);
  
  const resetForm = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setParsedData([]);
    setNewTeams([]);
  };

  const handleImport = async () => {
    if (!file || !selectedAlbum) {
      toast({
        title: "שגיאה",
        description: !file ? "נא לבחור קובץ" : "נא לבחור אלבום",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Parse CSV data
      const { parsedData: csvData } = parseCSVContent(fileContent);
      
      // Store parsed data for later use
      setParsedData(csvData);
      
      // Find teams that don't exist yet
      const existingStickers = getStickersByAlbumId(selectedAlbum);
      const existingTeams = new Set(existingStickers.map(sticker => sticker.team));
      const teamsInImport = new Set(csvData.map(([_, __, team]) => team));
      
      // Filter out teams that already exist
      const newTeamsFound = Array.from(teamsInImport).filter(team => !existingTeams.has(team));
      
      if (newTeamsFound.length > 0) {
        // Show the dialog to add logos for new teams
        setNewTeams(newTeamsFound);
        setShowNewTeamsDialog(true);
      } else {
        // If no new teams, proceed with import immediately
        completeImport(csvData);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעיבוד הקובץ",
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  const completeImport = (data: CSVData) => {
    try {
      const newStickers = importStickersFromCSV(selectedAlbum, data);
      
      toast({
        title: "ייבוא הצליח",
        description: `${newStickers.length} מדבקות יובאו בהצלחה.`,
        duration: 3000,
      });
      
      setIsOpen(false);
      resetForm();
      
      // Call the onImportComplete callback to refresh the view
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import completion error:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעיבוד הקובץ",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamLogosSubmit = (teamLogos: Record<string, string>) => {
    // Complete the import with the parsed data
    completeImport(parsedData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <FileInput className="h-4 w-4 mr-2" />
            ייבוא אקסל
          </Button>
        </DialogTrigger>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ייבוא מדבקות מקובץ CSV</DialogTitle>
            <DialogDescription>
              העלה קובץ CSV עם המדבקות. וודא כי העמודה הראשונה היא מספר הקלף, השנייה שם השחקן, והשלישית שם הקבוצה/הסדרה.
              אם הקובץ מכיל שורת כותרת, המערכת תזהה אותה באופן אוטומטי ותדלג עליה.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <AlbumSelectField 
              albums={albums} 
              selectedAlbum={selectedAlbum} 
              setSelectedAlbum={setSelectedAlbum} 
            />
            <FileUploadField 
              onFileChange={setFile} 
              fileInputRef={fileInputRef} 
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={handleImport} 
              disabled={!file || !selectedAlbum || isLoading}
            >
              {isLoading ? "מייבא..." : "ייבא מדבקות"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New teams logo dialog */}
      <NewTeamsLogoDialog
        open={showNewTeamsDialog}
        onOpenChange={setShowNewTeamsDialog}
        teams={newTeams}
        onSave={handleTeamLogosSubmit}
      />
    </>
  );
};

export default ImportExcelDialog;
