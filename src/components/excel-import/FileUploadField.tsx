
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, X } from "lucide-react";
import { parseCSV } from "@/utils/csv-parser";

interface FileUploadFieldProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onParse?: (data: any[]) => void;
}

const FileUploadField = ({ file, setFile, onParse }: FileUploadFieldProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = async (selectedFile: File) => {
    setError(null);
    
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain'
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx') && 
        !selectedFile.name.endsWith('.xls') && 
        !selectedFile.name.endsWith('.txt')) {
      setError('סוג קובץ לא תקין. יש להעלות קובץ Excel או CSV');
      return;
    }
    
    setFile(selectedFile);
    
    // If it's a CSV or TXT, try to parse it
    if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.txt') || selectedFile.type === 'text/plain' || selectedFile.type === 'text/csv') {
      try {
        const text = await selectedFile.text();
        const parsedData = parseCSV(text);
        console.log('Parsed CSV data:', parsedData);
        
        if (onParse && parsedData.length > 0) {
          onParse(parsedData);
        }
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('שגיאה בקריאת הקובץ. אנא ודא שהקובץ תקין');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        קובץ מדבקות
      </Label>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="mx-auto h-10 w-10 text-gray-400" />
          <div className="mt-2">
            <p className="text-sm font-medium">
              גרור ושחרר קובץ כאן או <span className="text-primary">לחץ כדי לבחור</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              CSV, Excel (.xlsx, .xls)
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.txt"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <FileUp className="h-8 w-8 text-blue-500" />
            <div className="space-y-0.5 mr-3">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveFile}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">הסר קובץ</span>
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUploadField;
