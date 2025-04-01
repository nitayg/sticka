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
import { UploadIcon, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseCSV } from "@/utils/csv-parser";
import { Progress } from "@/components/ui/progress";

interface ImportStickersProps {
  albumId: string;
  onImportComplete: () => void;
}

const ImportStickers = ({ albumId, onImportComplete }: ImportStickersProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const text = await selectedFile.text();
        const parsed = parseCSV(text);
        setParsedData(parsed);
        
        toast({
          title: "קובץ נטען",
          description: `${parsed.length} רשומות נמצאו בקובץ`,
        });
      } catch (error) {
        console.error("Error parsing file:", error);
      }
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
    setImportProgress(10);
    setErrorDetails(null);

    try {
      let data;
      
      if (parsedData) {
        data = parsedData.map(item => {
          return [item.number, item.name, item.team] as [number | string, string, string];
        });
      } else {
        setImportProgress(20);
        const text = await file.text();
        setImportProgress(30);
        const parsed = parseCSV(text);
        setImportProgress(40);
        
        data = parsed.map(item => {
          return [item.number, item.name, item.team] as [number | string, string, string];
        });
      }
      
      setImportProgress(50);
      
      if (!data.length) {
        throw new Error("לא נמצאו רשומות בקובץ");
      }
      
      const importProgressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = Math.min(prev + 5, 95);
          return newProgress;
        });
      }, 1000);
      
      try {
        const newStickers = await importStickersFromCSV(albumId, data);
        clearInterval(importProgressInterval);
        
        if (!newStickers || newStickers.length === 0) {
          throw new Error("לא הצלחנו לייבא את המדבקות. ייתכן שהן כבר קיימות באלבום.");
        }
        
        setImportProgress(100);
        
        toast({
          title: "הייבוא הושלם בהצלחה",
          description: `יובאו ${newStickers.length} מדבקות חדשות מתוך ${data.length} בקובץ`
        });

        setOpen(false);
        setFile(null);
        setParsedData(null);
        onImportComplete();
      } catch (importError: any) {
        clearInterval(importProgressInterval);
        console.error("שגיאה בייבוא:", importError);
        
        let errorMessage = "אירעה שגיאה בייבוא המדבקות";
        if (importError?.message?.includes("egress") || importError?.message?.includes("limit")) {
          errorMessage = "שגיאה בייבוא: חריגה ממגבלות השימוש בשרת. נסה לייבא פחות מדבקות בכל פעם.";
        }
        
        setErrorDetails(errorMessage);
        
        toast({
          title: "שגיאה בייבוא",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("שגיאה בייבוא:", error);
      setErrorDetails(error instanceof Error ? error.message : "אירעה שגיאה בייבוא הקובץ");
      
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
              accept=".csv,.xlsx,.xls,.txt" 
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              פורמט: מספר מדבקה, שם שחקן, שם קבוצה
            </p>
            {file && (
              <div className="text-sm text-green-600 mt-2">
                נבחר קובץ: {file.name}
                {parsedData && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {parsedData.length} רשומות זוהו בקובץ
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isLoading && (
            <div className="space-y-2">
              <Progress value={importProgress} className="h-2" />
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                מייבא מדבקות... {importProgress}%
              </div>
            </div>
          )}
          
          {errorDetails && !isLoading && (
            <div className="bg-destructive/10 p-3 rounded-md text-destructive flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{errorDetails}</div>
            </div>
          )}
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
