
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileInput } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Album, importStickersFromCSV } from "@/lib/data";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import NewTeamsLogoDialog from "./NewTeamsLogoDialog";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
  onImportComplete?: () => void; // Add callback for refreshing the view
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
  const [parsedData, setParsedData] = useState<Array<[number, string, string]>>([]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "הקובץ נקלט בהצלחה",
        description: `${selectedFile.name} מוכן לייבוא.`,
        duration: 3000,
      });
    }
  };

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
      // Use FileReader API with promise wrapper to handle file reading errors better
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error("קריאת הקובץ נכשלה"));
          }
        };
        
        reader.onerror = () => {
          reject(new Error("לא ניתן לקרוא את הקובץ, אנא ודא שהקובץ תקין ויש לך הרשאות לקרוא אותו"));
        };
        
        reader.readAsText(file);
      });
      
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      // Check if the first line looks like a header
      const firstLine = lines[0];
      const isHeader = firstLine && 
        (firstLine.toLowerCase().includes('מספר') || 
         firstLine.toLowerCase().includes('number') ||
         firstLine.toLowerCase().includes('שם') ||
         firstLine.toLowerCase().includes('name') ||
         firstLine.toLowerCase().includes('קבוצה') ||
         firstLine.toLowerCase().includes('team'));
      
      // Skip the header line if detected
      const dataLines = isHeader ? lines.slice(1) : lines;
      
      if (dataLines.length === 0) {
        throw new Error("הקובץ ריק או מכיל רק כותרות");
      }
      
      const parsedCsvData = dataLines.map(line => {
        const [numberStr, name, team] = line.split(',').map(item => item.trim());
        const number = parseInt(numberStr);
        
        if (isNaN(number) || !name || !team) {
          throw new Error(`שורה לא תקינה: ${line}`);
        }
        
        return [number, name, team] as [number, string, string];
      });
      
      // Store parsed data for later use (after logo upload if needed)
      setParsedData(parsedCsvData);
      
      // Find teams that don't exist yet
      const existingStickers = getStickersByAlbumId(selectedAlbum);
      const existingTeams = new Set(existingStickers.map(sticker => sticker.team));
      const teamsInImport = new Set(parsedCsvData.map(([_, __, team]) => team));
      
      // Filter out teams that already exist
      const newTeamsFound = Array.from(teamsInImport).filter(team => !existingTeams.has(team));
      
      if (newTeamsFound.length > 0) {
        // Show the dialog to add logos for new teams
        setNewTeams(newTeamsFound);
        setShowNewTeamsDialog(true);
      } else {
        // If no new teams, proceed with import immediately
        completeImport(parsedCsvData);
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

  const completeImport = (data: Array<[number, string, string]>) => {
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
    // In a real application, we would store these logos in a database
    // For this demo, we'll assume the logos are stored and complete the import
    
    // Now complete the import with the parsed data
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="album" className="text-right">בחר אלבום</Label>
              <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="בחר אלבום" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map(album => (
                    <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">בחר קובץ</Label>
              <div className="col-span-3">
                <Input 
                  id="file" 
                  type="file" 
                  accept=".csv,.txt" 
                  onChange={handleFileUpload} 
                  ref={fileInputRef}
                />
              </div>
            </div>
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
