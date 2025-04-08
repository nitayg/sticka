
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ParsedCsvRow } from "@/utils/csv-parser";
import { FileUploadSection } from "./FileUploadSection";
import { ImportProgress } from "./ImportProgress";
import { ImportWarning } from "./ImportWarning";
import { useCSVImport } from "@/hooks/useCSVImport";
import { useState, useEffect } from "react";
import { StorageEvents } from "@/lib/sync/constants";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ImportFormProps {
  albumId: string;
  onImportComplete: () => void;
  parsedData: ParsedCsvRow[] | null;
  setParsedData: (data: ParsedCsvRow[] | null) => void;
}

export const ImportForm = ({ 
  albumId, 
  onImportComplete,
  parsedData: initialParsedData,
  setParsedData: setInitialParsedData
}: ImportFormProps) => {
  const {
    file,
    setFile,
    isLoading,
    importProgress,
    errorDetails,
    parsedData,
    setParsedData,
    handleImport,
    parseFile
  } = useCSVImport({
    albumId,
    onImportComplete,
    initialParsedData
  });

  const [importResult, setImportResult] = useState<{ success: boolean; count: number } | null>(null);

  // Listen for import completion event
  useEffect(() => {
    const handleImportComplete = (e: CustomEvent) => {
      const { albumId: importedAlbumId, count, error } = e.detail || {};
      
      if (importedAlbumId === albumId) {
        if (error) {
          // Handle error from import event
          setImportResult({ success: false, count: 0 });
        } else {
          // Handle success
          setImportResult({ success: true, count: count || 0 });
        }
      }
    };
    
    window.addEventListener(
      StorageEvents.IMPORT_COMPLETE,
      handleImportComplete as EventListener
    );
    
    return () => {
      window.removeEventListener(
        StorageEvents.IMPORT_COMPLETE,
        handleImportComplete as EventListener
      );
    };
  }, [albumId]);

  // Sync parsed data with parent component
  const handleSetParsedData = (data: ParsedCsvRow[] | null) => {
    setParsedData(data);
    setInitialParsedData(data);
  };

  return (
    <div className="grid gap-4 py-4">
      <ImportWarning />
      
      <FileUploadSection 
        file={file} 
        setFile={setFile}
        isLoading={isLoading}
        parseFile={parseFile}
      />
      
      {isLoading && (
        <ImportProgress value={importProgress} />
      )}
      
      {errorDetails && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בייבוא</AlertTitle>
          <AlertDescription>
            {errorDetails}
            {errorDetails.includes('טכנית') || errorDetails.includes('מודול') ? (
              <div className="mt-2 text-xs">
                בעיה טכנית במערכת הייבוא. אנא נסו שוב מאוחר יותר או פנו לתמיכה.
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      )}
      
      {importResult && !isLoading && (
        importResult.success ? (
          <ImportSuccess count={importResult.count} />
        ) : (
          <ImportError errorMessage="שגיאה בשמירת הנתונים בשרת. בדוק את הלוג לפרטים נוספים." />
        )
      )}
      
      <DialogFooter>
        <Button 
          onClick={handleImport} 
          disabled={!file && !parsedData || isLoading}
          className={importResult?.success ? "bg-green-600 hover:bg-green-700" : ""}
        >
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

const ImportSuccess = ({ count }: { count: number }) => {
  return (
    <div className="bg-green-100 p-3 rounded-md text-green-800 flex items-start">
      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        {count > 0 ? 
          `יובאו ${count} מדבקות בהצלחה` : 
          `לא יובאו מדבקות חדשות, ייתכן שכולן כבר קיימות באלבום`}
      </div>
    </div>
  );
};
