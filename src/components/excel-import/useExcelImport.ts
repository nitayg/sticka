import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { importStickersFromCSV } from "@/lib/sticker-operations";
import { parseCSV, ParsedCsvRow } from "@/utils/csv-parser";

interface UseExcelImportProps {
  selectedAlbum: string;
  onImportComplete: () => void;
}

export const useExcelImport = ({ selectedAlbum, onImportComplete }: UseExcelImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[]>([]);
  const { toast } = useToast();
  
  const handleFileUpload = (data: ParsedCsvRow[]) => {
    setParsedData(data);
    
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
    } else {
      console.log(`File upload contains NO stickers in range 426-440`);
    }
    
    if (alphanumericStickers.length > 0) {
      console.log(`File upload contains ${alphanumericStickers.length} alphanumeric stickers:`, alphanumericStickers);
    }
    
    toast({
      title: "קובץ נטען בהצלחה",
      description: `נמצאו ${data.length} מדבקות בקובץ`,
    });
  };
  
  const startProgressUpdate = () => {
    setImportProgress(10);
    
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 2000);
    
    return interval;
  };
  
  const handleImport = async () => {
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
    
    const progressInterval = startProgressUpdate();
    
    try {
      let dataToImport: [number | string, string, string][] = [];
      
      if (parsedData.length > 0) {
        console.log(`Using ${parsedData.length} already parsed rows for import`);
        dataToImport = parsedData.map(row => {
          return [row.number, row.name, row.team];
        });
      } 
      else if (file) {
        console.log(`Parsing file (${file.name}) for import`);
        const fileContent = await file.text();
        const parsed = parseCSV(fileContent);
        dataToImport = parsed.map(row => {
          return [row.number, row.name, row.team];
        });
      }
      
      if (dataToImport.length === 0) {
        throw new Error("לא נמצאו מדבקות בקובץ");
      }
      
      const criticalRangeItems = dataToImport.filter(([num]) => {
        if (typeof num === 'number') {
          return num >= 426 && num <= 440;
        }
        return false;
      });
      
      const alphanumericItems = dataToImport.filter(([num]) => {
        return typeof num === 'string' && /^[A-Za-z]/.test(num.toString());
      });
      
      console.log(`Importing ${dataToImport.length} stickers to album ${selectedAlbum}`);
      
      if (criticalRangeItems.length > 0) {
        console.log(`Import data contains ${criticalRangeItems.length} stickers in range 426-440:`, criticalRangeItems);
      }
      
      if (alphanumericItems.length > 0) {
        console.log(`Import data contains ${alphanumericItems.length} alphanumeric stickers:`, alphanumericItems);
      }
      
      const BATCH_SIZE = 100;
      const allImportedStickers = [];
      
      for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
        const batch = dataToImport.slice(i, i + BATCH_SIZE);
        console.log(`Importing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(dataToImport.length/BATCH_SIZE)}, size: ${batch.length}`);
        
        const hasCriticalRange = batch.some(([num]) => typeof num === 'number' && num >= 426 && num <= 440);
        const hasAlphanumeric = batch.some(([num]) => typeof num === 'string' && /^[A-Za-z]/.test(num.toString()));
        
        if (hasCriticalRange) {
          console.log(`Batch ${i/BATCH_SIZE + 1} contains critical range stickers`);
        }
        
        if (hasAlphanumeric) {
          console.log(`Batch ${i/BATCH_SIZE + 1} contains alphanumeric stickers`);
        }
        
        try {
          const result = await importStickersFromCSV(selectedAlbum, batch);
          
          if (result && result.length > 0) {
            console.log(`Successfully imported ${result.length} stickers from batch ${i/BATCH_SIZE + 1}`);
            allImportedStickers.push(...result);
            
            setImportProgress(Math.min(90, 10 + (i + batch.length) / dataToImport.length * 80));
            
            if (i + BATCH_SIZE < dataToImport.length) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            console.warn(`No stickers imported from batch ${i/BATCH_SIZE + 1}`);
          }
        } catch (error) {
          console.error(`Error importing batch ${i/BATCH_SIZE + 1}:`, error);
        }
      }
      
      if (!allImportedStickers.length) {
        throw new Error("שגיאה בייבוא המדבקות לשרת");
      }
      
      const importedCriticalRange = allImportedStickers.filter(s => {
        if (typeof s.number === 'number') {
          return s.number >= 426 && s.number <= 440;
        }
        return false;
      });
      
      const importedAlphanumeric = allImportedStickers.filter(s => 
        typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
      );
      
      console.log(`Successfully imported ${allImportedStickers.length} stickers in total`);
      console.log(`Imported ${importedCriticalRange.length} critical range stickers`);
      console.log(`Imported ${importedAlphanumeric.length} alphanumeric stickers`);
      
      if (criticalRangeItems.length > 0 && importedCriticalRange.length < criticalRangeItems.length) {
        console.warn(`Warning: Only imported ${importedCriticalRange.length}/${criticalRangeItems.length} critical range stickers (426-440)`);
        toast({
          title: "חלק מהמדבקות לא יובאו",
          description: `יובאו רק ${importedCriticalRange.length} מתוך ${criticalRangeItems.length} מדבקות בטווח 426-440. אנא נסה שוב.`,
          variant: "destructive",
        });
      }
      
      if (alphanumericItems.length > 0 && importedAlphanumeric.length < alphanumericItems.length) {
        console.warn(`Warning: Only imported ${importedAlphanumeric.length}/${alphanumericItems.length} alphanumeric stickers`);
        toast({
          title: "חלק מהמדבקות לא יובאו",
          description: `יובאו רק ${importedAlphanumeric.length} מתוך ${alphanumericItems.length} מדבקות אלפאנומריות (L1-L20). אנא נסה שוב.`,
          variant: "destructive",
        });
      }
      
      setImportProgress(100);
      
      setFile(null);
      setParsedData([]);
      
      toast({
        title: "ייבוא הושלם בהצלחה",
        description: `יובאו ${allImportedStickers.length} מדבקות בהצלחה`,
      });
      
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId: selectedAlbum, action: 'import', count: allImportedStickers.length } 
      }));
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      onImportComplete();
    } catch (error) {
      console.error("Error importing Excel:", error);
      toast({
        title: "שגיאה בייבוא",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת ייבוא המדבקות",
        variant: "destructive",
      });
      
      onImportComplete();
    } finally {
      clearInterval(progressInterval);
      setIsImporting(false);
    }
  };

  return {
    file,
    setFile,
    parsedData,
    isImporting,
    importProgress,
    handleFileUpload,
    handleImport
  };
};
