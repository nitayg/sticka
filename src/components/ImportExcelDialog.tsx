
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileInput } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Album, importStickersFromCSV } from "@/lib/data";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
}

const ImportExcelDialog = ({ albums, selectedAlbum, setSelectedAlbum }: ImportExcelDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const parsedData = lines.map(line => {
        const [numberStr, name, team] = line.split(',').map(item => item.trim());
        const number = parseInt(numberStr);
        
        if (isNaN(number) || !name || !team) {
          throw new Error(`שורה לא תקינה: ${line}`);
        }
        
        return [number, name, team] as [number, string, string];
      });
      
      const newStickers = importStickersFromCSV(selectedAlbum, parsedData);
      
      toast({
        title: "ייבוא הצליח",
        description: `${newStickers.length} מדבקות יובאו בהצלחה.`,
        duration: 3000,
      });
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעיבוד הקובץ",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <FileInput className="h-4 w-4 mr-2" />
          ייבוא אקסל
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ייבוא מדבקות מקובץ CSV</DialogTitle>
          <DialogDescription>
            העלה קובץ CSV עם המדבקות. וודא כי העמודה הראשונה היא מספר הקלף, השנייה שם השחקן, והשלישית שם הקבוצה/הסדרה.
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
                accept=".csv" 
                onChange={handleFileUpload} 
                ref={fileInputRef}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleImport} disabled={!file || !selectedAlbum}>
            ייבא מדבקות
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelDialog;
