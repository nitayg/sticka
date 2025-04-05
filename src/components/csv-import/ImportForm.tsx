
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { importStickersFromCSV } from "@/lib/data";
import { ParsedCsvRow } from "@/utils/csv-parser";
import { FileUploadSection } from "./FileUploadSection";
import { ImportProgress } from "./ImportProgress";
import { ImportWarning } from "./ImportWarning";

interface ImportFormProps {
  albumId: string;
  onImportComplete: () => void;
  parsedData: ParsedCsvRow[] | null;
  setParsedData: (data: ParsedCsvRow[] | null) => void;
}

export const ImportForm = ({ 
  albumId, 
  onImportComplete,
  parsedData,
  setParsedData 
}: ImportFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // If too many records, ask for confirmation
      if (data.length > 200) {
        const shouldProceed = window.confirm(
          `אזהרה: אתה מנסה לייבא ${data.length} רשומות. ייבוא גדול עלול לגרום לשגיאות בשל מגבלות השרת. מומלץ לייבא בקבוצות של עד 200 רשומות. להמשיך בכל זאת?`
        );
        
        if (!shouldProceed) {
          setIsLoading(false);
          setImportProgress(0);
          return;
        }
      }
      
      const importProgressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = Math.min(prev + 3, 95);
          return newProgress;
        });
      }, 1000);
      
      try {
        const newStickers = await importStickersFromCSV(albumId, data);
        clearInterval(importProgressInterval);
        
        if (!newStickers || newStickers.length === 0) {
          throw new Error("לא הצלחנו לייבא את המדבקות. ייתכן שהן כבר קיימות באלבום או שיש מגבלת שימוש בשרת.");
        }
        
        setImportProgress(100);
        
        toast({
          title: "הייבוא הושלם בהצלחה",
          description: `יובאו ${newStickers.length} מדבקות חדשות מתוך ${data.length} בקובץ`
        });

        setFile(null);
        setParsedData(null);
        onImportComplete();
      } catch (importError: any) {
        clearInterval(importProgressInterval);
        console.error("שגיאה בייבוא:", importError);
        
        let errorMessage = "אירעה שגיאה בייבוא המדבקות";
        
        // Check for specific error types
        if (importError?.message?.includes("egress") || 
            importError?.message?.includes("exceeded") || 
            importError?.message?.includes("limit")) {
          errorMessage = "שגיאה בייבוא: חריגה ממגבלות השימוש בשרת. נסה לייבא פחות מדבקות בכל פעם (עד 100-200) או לבצע ייבוא בהפרשי זמן של כמה דקות.";
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
    <div className="grid gap-4 py-4">
      <ImportWarning />
      
      <FileUploadSection 
        file={file} 
        setFile={setFile}
        isLoading={isLoading}
        setParsedData={setParsedData}
      />
      
      {isLoading && (
        <ImportProgress value={importProgress} />
      )}
      
      {errorDetails && !isLoading && (
        <ImportError errorMessage={errorDetails} />
      )}
      
      <DialogFooter>
        <Button onClick={handleImport} disabled={!file || isLoading}>
          {isLoading ? "מייבא..." : "ייבא מדבקות"}
        </Button>
      </DialogFooter>
    </div>
  );
};

// Helper components that are only used in this file
const ImportError = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <div className="bg-destructive/10 p-3 rounded-md text-destructive flex items-start">
      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{errorMessage}</div>
    </div>
  );
};

// Import necessary functions and components
import { AlertCircle } from "lucide-react";
import { parseCSV } from "@/utils/csv-parser";
