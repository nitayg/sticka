
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
      // Read file as ArrayBuffer for proper encoding detection
      const buffer = await readFileAsArrayBuffer(selectedFile);
      
      // Use TextDecoder with the detected encoding
      const detectedEncoding = detectEncoding(buffer);
      console.log(`Detected file encoding: ${detectedEncoding}`);
      
      // Use the detected encoding
      const decoder = new TextDecoder(detectedEncoding);
      const text = decoder.decode(buffer);
      
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
  
  // Helper to detect encoding from content
  const detectEncoding = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    
    // Check for UTF-8 BOM
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'utf-8';
    }
    
    // Check for Hebrew Windows-1255 encoding (rough heuristic)
    let hebrewCharsCount = 0;
    for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
      if (bytes[i] >= 0xE0 && bytes[i] <= 0xFA) {
        hebrewCharsCount++;
      }
    }
    
    if (hebrewCharsCount > 10) {
      return 'windows-1255';
    }
    
    // Default to UTF-8
    return 'utf-8';
  };
  
  // Helper to read file as ArrayBuffer
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
      
      <p className="text-xs text-muted-foreground mt-1">
        תומך בקידוד UTF-8 ו-Windows-1255 לקבצי CSV עם טקסט בעברית
      </p>
    </div>
  );
};

export default FileUploadField;
