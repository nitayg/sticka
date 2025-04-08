
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

  const parseFile = async (selectedFile: File): Promise<void> => {
    try {
      // Read file as ArrayBuffer for proper encoding detection
      const buffer = await readFileAsArrayBuffer(selectedFile);
      
      // Parse the CSV content
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);
      const parsed = parseCSV(text);
      
      setParsedData(parsed);
      
      // Reduced warning threshold to prevent egress issues
      if (parsed.length > 100) {
        toast({
          title: "שים לב - קובץ גדול",
          description: `קובץ מכיל ${parsed.length} רשומות. ייבוא קבצים גדולים עלול לצרוך כמות משמעותית של תעבורת נתונים. מומלץ לייבא בקבוצות של עד 50-100 רשומות.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "קובץ נטען",
          description: `${parsed.length} רשומות נמצאו בקובץ`,
        });
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בניתוח הקובץ. ודא שהקובץ בפורמט CSV תקין",
        variant: "destructive"
      });
    }
  };

  // Helper function to read file as ArrayBuffer for encoding detection
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
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
        
        // Read file with proper encoding detection
        const buffer = await readFileAsArrayBuffer(file);
        setImportProgress(30);
        
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
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
      
      // Reduced threshold for egress warnings
      if (data.length > 100) {
        const shouldProceed = window.confirm(
          `אזהרה: אתה מנסה לייבא ${data.length} רשומות. ייבוא גדול עלול לגרום לשגיאות וצריכת תעבורת נתונים גבוהה. מומלץ לייבא בקבוצות של עד 50-100 רשומות. להמשיך בכל זאת?`
        );
        
        if (!shouldProceed) {
          setIsLoading(false);
          setImportProgress(0);
          return;
        }
      }
      
      // Slower update interval to reduce UI updates
      const importProgressInterval = setInterval(() => {
        setImportProgress(prev => {
          // Slower progress updates
          const newProgress = Math.min(prev + 1, 95);
          return newProgress;
        });
      }, 2000); // Increased from 1000ms to 2000ms
      
      try {
        // Split data into smaller chunks to reduce egress
        const MAX_CHUNK_SIZE = 50; // Reduced from implicit large size to 50
        let importedCount = 0;
        
        if (data.length > MAX_CHUNK_SIZE) {
          // Process in smaller chunks
          const chunks = [];
          for (let i = 0; i < data.length; i += MAX_CHUNK_SIZE) {
            chunks.push(data.slice(i, i + MAX_CHUNK_SIZE));
          }
          
          console.log(`Processing import in ${chunks.length} chunks of max ${MAX_CHUNK_SIZE} stickers`);
          
          const allImported = [];
          for (let i = 0; i < chunks.length; i++) {
            console.log(`Processing chunk ${i+1}/${chunks.length}`);
            
            // Add delay between chunks to prevent egress limits
            if (i > 0) {
              toast({
                title: `מעבד קבוצה ${i+1}/${chunks.length}`,
                description: `הושלמו ${importedCount} מדבקות עד כה. אנא המתן...`
              });
              
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            const chunkStickers = await importStickersFromCSV(albumId, chunks[i]);
            if (chunkStickers && chunkStickers.length > 0) {
              allImported.push(...chunkStickers);
              importedCount += chunkStickers.length;
              
              // Update progress based on chunks
              setImportProgress(50 + Math.floor((i+1) * 45 / chunks.length));
            }
          }
          
          clearInterval(importProgressInterval);
          setImportProgress(100);
          
          if (allImported.length === 0) {
            throw new Error("לא הצלחנו לייבא את המדבקות. ייתכן שהן כבר קיימות באלבום או שיש מגבלת שימוש בשרת.");
          }
          
          toast({
            title: "הייבוא הושלם בהצלחה",
            description: `יובאו ${allImported.length} מדבקות חדשות מתוך ${data.length} בקובץ`
          });
        } else {
          // Small import, process normally
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
        }

        setFile(null);
        setParsedData(null);
        onImportComplete();
      } catch (importError: any) {
        clearInterval(importProgressInterval);
        console.error("שגיאה בייבוא:", importError);
        
        let errorMessage = "אירעה שגיאה בייבוא המדבקות";
        
        if (importError?.message?.includes("egress") || 
            importError?.message?.includes("exceeded") || 
            importError?.message?.includes("limit")) {
          errorMessage = "שגיאה בייבוא: חריגה ממגבלות תעבורת הנתונים בשרת. נסה לייבא פחות מדבקות בכל פעם (עד 50-100) או לבצע ייבוא בהפרשי זמן של כמה דקות.";
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
