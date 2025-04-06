
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { importStickersFromCSV } from "@/lib/stickers";
import { parseCSV, ParsedCsvRow } from "@/utils/csv-parser";

interface UseExcelImportProps {
  selectedAlbum: string;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  totalCount: number;
}

export const useExcelImport = ({ selectedAlbum, onImportComplete }: UseExcelImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Reset all import state
  const resetImportState = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setImportProgress(0);
    setImportResult(null);
    setErrorMessage(null);
  }, []);
  
  const handleFileUpload = useCallback((data: ParsedCsvRow[]) => {
    setParsedData(data);
    setErrorMessage(null);
    
    const criticalRangeStickers = data.filter(row => {
      if (typeof row.number === 'number') {
        return row.number >= 426 && row.number <= 440;
      }
      return false;
    });
    
    const alphanumericStickers = data.filter(row => 
      typeof row.number === 'string' && /^[A-Za-z]/.test(row.number.toString())
    );
    
    console.log(`File upload contains ${data.length} total stickers`);
    
    if (criticalRangeStickers.length > 0) {
      console.log(`File upload contains ${criticalRangeStickers.length} stickers in range 426-440:`, criticalRangeStickers);
    }
    
    if (alphanumericStickers.length > 0) {
      console.log(`File upload contains ${alphanumericStickers.length} alphanumeric stickers:`, alphanumericStickers);
    }
    
    toast({
      title: "קובץ נטען בהצלחה",
      description: `נמצאו ${data.length} מדבקות בקובץ${alphanumericStickers.length > 0 ? ` (כולל ${alphanumericStickers.length} מדבקות אלפאנומריות)` : ''}`,
    });
  }, [toast]);
  
  // More reliable progress tracking
  const updateImportProgress = useCallback((current: number, total: number) => {
    // Calculate percentage with a max of 95% until complete
    const calculatedPercentage = Math.min(Math.floor((current / total) * 95), 95);
    setImportProgress(calculatedPercentage);
  }, []);
  
  const completeImport = useCallback((success: boolean, importedCount: number, totalCount: number) => {
    // Set progress to 100% on completion
    setImportProgress(100);
    setImportResult({ success, importedCount, totalCount });
    setIsImporting(false);
    
    // Notify completion
    if (success) {
      toast({
        title: "ייבוא הושלם בהצלחה",
        description: `יובאו ${importedCount} מדבקות בהצלחה${importedCount < totalCount ? ` (${totalCount - importedCount} לא יובאו)` : ''}`,
      });
      
      // Trigger global data refresh
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId: selectedAlbum, action: 'import', count: importedCount } 
      }));
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      
      // Notify parent component
      onImportComplete();
    }
  }, [selectedAlbum, toast, onImportComplete]);
  
  const handleImport = useCallback(async () => {
    if (!selectedAlbum) {
      toast({
        title: "לא נבחר אלבום",
        description: "יש לבחור אלבום לפני ייבוא מדבקות",
        variant: "destructive",
      });
      return;
    }
    
    if (!file && parsedData.length === 0) {
      toast({
        title: "לא נבחר קובץ",
        description: "יש לבחור קובץ אקסל או CSV לייבוא",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    setImportProgress(5);  // Start at 5%
    setErrorMessage(null);
    
    try {
      let dataToImport: [number | string, string, string][] = [];
      
      if (parsedData.length > 0) {
        console.log(`Using ${parsedData.length} already parsed rows for import`);
        dataToImport = parsedData.map(row => [row.number, row.name, row.team]);
        setImportProgress(10);  // Advance to 10% after preparing data
      } 
      else if (file) {
        console.log(`Parsing file (${file.name}) for import`);
        const fileContent = await file.text();
        setImportProgress(10);
        
        const parsed = parseCSV(fileContent);
        dataToImport = parsed.map(row => [row.number, row.name, row.team]);
        setImportProgress(20);  // Advance to 20% after parsing file
      }
      
      if (dataToImport.length === 0) {
        throw new Error("לא נמצאו מדבקות בקובץ");
      }
      
      console.log(`Importing ${dataToImport.length} stickers to album ${selectedAlbum}`);
      
      // Calculate smaller batch size for more reliability
      const BATCH_SIZE = 25;
      const batches = Math.ceil(dataToImport.length / BATCH_SIZE);
      const allImportedStickers = [];
      
      // Split import into smaller batches for better reliability
      for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const batch = dataToImport.slice(i, i + BATCH_SIZE);
        console.log(`Importing batch ${batchNumber}/${batches}, size: ${batch.length}`);
        
        // Find any alphanumeric stickers in this batch for special handling
        const specialStickers = batch.filter(([number]) => 
          typeof number === 'string' && /^[A-Za-z]/.test(number.toString())
        );
        
        if (specialStickers.length > 0) {
          console.log(`Batch ${batchNumber} contains ${specialStickers.length} alphanumeric stickers:`, specialStickers);
        }
        
        try {
          // Update progress - each batch contributes proportionally to overall progress
          updateImportProgress(i, dataToImport.length);
          
          const result = await importStickersFromCSV(selectedAlbum, batch);
          
          if (result && result.length > 0) {
            console.log(`Successfully imported ${result.length} stickers from batch ${batchNumber}`);
            allImportedStickers.push(...result);
            
            // Update progress after each successful batch
            updateImportProgress(i + batch.length, dataToImport.length);
            
            // Add a pause between batches to reduce server load
            if (i + BATCH_SIZE < dataToImport.length) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } else {
            console.warn(`No stickers imported from batch ${batchNumber}`);
          }
        } catch (error) {
          console.error(`Error importing batch ${batchNumber}:`, error);
          // Continue with next batch even if this one fails
        }
      }
      
      if (allImportedStickers.length === 0) {
        throw new Error("שגיאה בייבוא המדבקות לשרת. ייתכן שחלק מהמדבקות כבר קיימות או שיש בעיה בקובץ.");
      }
      
      console.log(`Successfully imported ${allImportedStickers.length}/${dataToImport.length} stickers in total`);
      
      // Complete the import successfully
      completeImport(true, allImportedStickers.length, dataToImport.length);
      
    } catch (error) {
      console.error("Error importing Excel:", error);
      setErrorMessage(error instanceof Error ? error.message : "אירעה שגיאה בעת ייבוא המדבקות");
      
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת ייבוא המדבקות",
        variant: "destructive",
      });
      
      // Complete the import with failure
      completeImport(false, 0, 0);
    }
  }, [selectedAlbum, file, parsedData, toast, updateImportProgress, completeImport]);

  return {
    file,
    setFile,
    parsedData,
    isImporting,
    importProgress,
    importResult,
    errorMessage,
    handleFileUpload,
    handleImport,
    resetImportState
  };
};
