
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { ParsedCsvRow } from "@/utils/csv-parser";
import { FileUploadSection } from "./FileUploadSection";
import { ImportProgress } from "./ImportProgress";
import { ImportWarning } from "./ImportWarning";
import { useCSVImport } from "@/hooks/useCSVImport";

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
