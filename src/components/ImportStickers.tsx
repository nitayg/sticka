import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importStickersFromCSV } from "@/lib/data";
import { UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportStickersProps {
  albumId: string;
  onImportComplete: () => void;
}

const ImportStickers = ({ albumId, onImportComplete }: ImportStickersProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "שגיאה",
        description: "יש לבחור קובץ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      // מעבר על כל שורה וחילוץ הנתונים
      const stickersData: [number | string, string, string][] = rows.map(row => {
        const columns = row.split(',').map(col => col.trim());
        const stickerNumber = columns[0];
        const name = columns[1] || '';
        const team = columns[2] || '';
        
        // Check if the number contains any non-numeric characters
        const isAlphanumeric = /[^0-9]/.test(stickerNumber);
        
        // If it's alphanumeric (like "L1"), keep it as a string
        // Otherwise parse it as a number
        const number = isAlphanumeric 
          ? stickerNumber 
          : parseInt(stickerNumber, 10);
        
        if (typeof number === 'number' && isNaN(number)) {
          throw new Error(`שגיאה בפרסור המספר בשורה: ${row}`);
        }
        
        return [number, name, team] as [number | string, string, string];
      });
      
      const newStickers = await importStickersFromCSV(albumId, stickersData);
      
      toast({
        title: "הייבוא הושלם בהצלחה",
        description: `יובאו ${newStickers.length} מדבקות חדשות`
      });

      setOpen(false);
      setFile(null);
      onImportComplete();
    } catch (error) {
      console.error("שגיאה בייבוא:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בייבוא הקובץ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon className="h-4 w-4 ml-2" />
          ייבוא מדבקות
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ייבוא מדבקות מקובץ</DialogTitle>
          <DialogDescription>
            העלה קובץ CSV עם מדבקות בפורמט הבא: מספר, שם, קבוצה
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="stickers-file">קובץ מדבקות</Label>
            <Input 
              id="stickers-file" 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground mt-1">
              פורמט: מספר מדבקה, שם שחקן, שם קבוצה
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "מייבא..." : "ייבא מדבקות"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStickers;
