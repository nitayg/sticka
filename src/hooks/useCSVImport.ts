
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { importStickersFromCSV } from "@/lib/data";
import { ParsedCsvRow, parseCSV } from "@/utils/csv-parser";

interface UseCSVImportProps {
  albumId: string;
  onImportComplete: () => void;
  initialParsedData?: ParsedCsvRow[] | null;
}

interface UseCSVImportReturn {
  file: File | null;
  setFile: (file: File | null) => void;
  isLoading: boolean;
  importProgress: number;
  errorDetails: string | null;
  parsedData: ParsedCsvRow[] | null;
  setParsedData: (data: ParsedCsvRow[] | null) => void;
  handleImport: () => Promise<void>;
  parseFile: (file: File) => Promise<void>;
}

export const useCSVImport = ({
  albumId,
  onImportComplete,
  initialParsedData = null,
}: UseCSVImportProps): UseCSVImportReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[] | null>(initialParsedData);
  const { toast } = useToast();

  const parseFile = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      
      if (parsed.length > 200) {
        toast({
          title: "שים לב - קובץ גדול",
          description: `קובץ מכיל ${parsed.length} רשומות. ייתכן שיש צורך לייבא בקבוצות קטנות יותר כדי להימנע ממגבלות של השרת.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "קובץ נטען",
          description: `${parsed.length} רשומות נמצאו בקובץ`,
        });
      }
      
      return parsed;
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בניתוח הקובץ. ודא שהקובץ בפורמט CSV תקין",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleImport = async () => {
    if (!file && !parsedData) {
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
      } else if (file) {
        setImportProgress(20);
        const text = await file.text();
        setImportProgress(30);
        const parsed = parseCSV(text);
        setImportProgress(40);
        
        data = parsed.map(item => {
          return [item.number, item.name, item.team] as [number | string, string, string];
        });
      } else {
        throw new Error("No file or parsed data available");
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

  return {
    file,
    setFile,
    isLoading,
    importProgress,
    errorDetails,
    parsedData,
    setParsedData,
    handleImport,
    parseFile
  };
};
