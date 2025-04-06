
import { ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { parseCSV, ParsedCsvRow } from "@/utils/csv-parser";

interface FileUploadFieldProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onParse: (data: ParsedCsvRow[]) => void;
  disabled?: boolean;
}

const FileUploadField = ({ file, setFile, onParse, disabled = false }: FileUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    try {
      const text = await selectedFile.text();
      const parsedData = parseCSV(text);
      
      // Log alphanumeric sticker data for debugging
      const alphanumericStickers = parsedData.filter(row => 
        typeof row.number === 'string' && /^[A-Za-z]/.test(row.number)
      );
      
      if (alphanumericStickers.length > 0) {
        console.log(`Found ${alphanumericStickers.length} alphanumeric stickers:`, 
          alphanumericStickers.map(s => ({ number: s.number, name: s.name })));
      }
      
      onParse(parsedData);
    } catch (error) {
      console.error("Error parsing file:", error);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-2">
      <label htmlFor="file-upload" className="block text-sm font-medium">
        בחר קובץ אקסל או CSV
      </label>
      
      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={disabled}
      />
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled}
          className="flex-grow"
        >
          {file ? "החלף קובץ" : "בחר קובץ"}
        </Button>
        
        {file && (
          <div className="text-sm truncate max-w-[200px]">{file.name}</div>
        )}
      </div>
    </div>
  );
};

export default FileUploadField;
