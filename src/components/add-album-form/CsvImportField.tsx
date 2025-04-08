
import React, { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle, FileText, RefreshCw } from "lucide-react";

interface CsvImportFieldProps {
  csvContent: string;
  setCsvContent: (content: string) => void;
}

const CsvImportField = ({ csvContent, setCsvContent }: CsvImportFieldProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    totalLines: number;
    alphanumericCount: number;
    numericCount: number;
    encoding?: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    // Check file extension
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'txt') {
      toast({
        title: "סוג קובץ לא נתמך",
        description: "אנא העלה קובץ CSV או TXT",
        variant: "destructive",
        duration: 3000,
      });
      resetFileInput();
      return;
    }
    
    // Read file as ArrayBuffer for proper encoding detection
    const reader = new FileReader();
    
    // First try to detect encoding from the file
    const arrayBufferReader = new FileReader();
    arrayBufferReader.onload = (arrEvent) => {
      try {
        const buffer = arrEvent.target?.result as ArrayBuffer;
        
        // Simple encoding detection
        const bytes = new Uint8Array(buffer);
        let detectedEncoding = 'utf-8';
        
        // Check for UTF-8 BOM
        if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
          detectedEncoding = 'utf-8';
        } 
        // Check for Hebrew Windows-1255 encoding (rough heuristic)
        else {
          let hebrewCharsCount = 0;
          for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
            if (bytes[i] >= 0xE0 && bytes[i] <= 0xFA) {
              hebrewCharsCount++;
            }
          }
          
          if (hebrewCharsCount > 10) {
            detectedEncoding = 'windows-1255';
          }
        }
        
        console.log(`Detected encoding: ${detectedEncoding}`);
        
        // Now read content with the detected encoding
        const decoder = new TextDecoder(detectedEncoding);
        try {
          const content = decoder.decode(buffer);
          
          // Clean up the content - handle different line breaks and separators
          const cleanedContent = content
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();
          
          setCsvContent(cleanedContent);
          
          // Quick validation of content
          const lines = cleanedContent.split('\n').filter(line => line.trim().length > 0);
          setLineCount(lines.length);
          setFileName(selectedFile.name);
          
          // Get additional stats about the content
          let alphanumericCount = 0;
          let numericCount = 0;
          
          // Sample a few lines and analyze
          const sampleSize = Math.min(100, lines.length);
          const sampleLines = lines.slice(0, sampleSize);
          
          sampleLines.forEach(line => {
            const fields = line.split(/[,;\t]/).map(field => field.trim());
            if (fields.length > 0) {
              const numberStr = fields[0];
              if (/[a-zA-Z]/.test(numberStr)) {
                alphanumericCount++;
              } else if (/^\d+$/.test(numberStr)) {
                numericCount++;
              }
            }
          });
          
          // Extrapolate for large files
          if (lines.length > sampleSize) {
            const ratio = lines.length / sampleSize;
            alphanumericCount = Math.round(alphanumericCount * ratio);
            numericCount = Math.round(numericCount * ratio);
          }
          
          setFileInfo({
            totalLines: lines.length,
            alphanumericCount,
            numericCount,
            encoding: detectedEncoding
          });
          
          // Sample a few lines to show in the console for debugging
          const logSampleLines = lines.slice(0, 5);
          console.log("CSV Sample lines:", logSampleLines);
          
          if (lines.length === 0) {
            toast({
              title: "קובץ ריק",
              description: "הקובץ שהעלית נראה ריק. אנא בדוק את תוכן הקובץ.",
              variant: "destructive",
              duration: 3000,
            });
          } else {
            toast({
              title: "הקובץ נקלט בהצלחה",
              description: `${selectedFile.name} מוכן לייבוא עם ${lines.length} שורות (קידוד: ${detectedEncoding}).`,
              duration: 3000,
            });
          }
        } catch (decodeError) {
          console.error("Error decoding file with detected encoding:", decodeError);
          // Fallback to UTF-8
          const fallbackDecoder = new TextDecoder('utf-8');
          const fallbackContent = fallbackDecoder.decode(buffer);
          setCsvContent(fallbackContent);
          
          toast({
            title: "אזהרת קידוד",
            description: "זיהוי הקידוד נכשל, משתמש בקידוד UTF-8 כברירת מחדל",
            variant: "destructive",
            duration: 3000,
          });
        }
        
      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          title: "שגיאה בעיבוד הקובץ",
          description: "אירעה שגיאה בעת עיבוד הקובץ. אנא נסה שוב.",
          variant: "destructive",
          duration: 3000,
        });
        resetFileInput();
      } finally {
        setIsLoading(false);
      }
    };
    
    arrayBufferReader.onerror = () => {
      toast({
        title: "שגיאה בקריאת הקובץ",
        description: "אירעה שגיאה בעת קריאת הקובץ. אנא נסה שוב.",
        variant: "destructive",
        duration: 3000,
      });
      resetFileInput();
      setIsLoading(false);
    };
    
    arrayBufferReader.readAsArrayBuffer(selectedFile);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCsvContent('');
    setFileName(null);
    setLineCount(null);
    setFileInfo(null);
  };

  return (
    <div className="space-y-3 text-right">
      <Label htmlFor="file">העלאת קובץ CSV</Label>
      <div className="space-y-2">
        <Input 
          id="file" 
          type="file" 
          accept=".csv,.txt" 
          onChange={handleFileUpload} 
          ref={fileInputRef}
          dir="rtl"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground text-right">
          פורמט הקובץ: מספר, שם, קבוצה/סדרה בכל שורה. 
          המערכת תזהה באופן אוטומטי שורת כותרת אם קיימת ותתמוך בקבצים עם קידוד UTF-8 ו-Windows-1255.
        </p>
        
        {isLoading && (
          <div className="flex items-center justify-center p-2">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">מעבד קובץ...</span>
          </div>
        )}
        
        {csvContent && fileName && !isLoading && (
          <div className="bg-muted/50 p-3 rounded-md mt-2">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFileInput}
                className="h-7 px-2 text-xs"
              >
                נקה
              </Button>
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <FileText className="h-3 w-3" />
                <span>{fileName}</span>
              </div>
            </div>
            
            {lineCount && (
              <div className="mt-2">
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>הקובץ מכיל {lineCount} שורות מוכנות לייבוא</span>
                </p>
                
                {fileInfo && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    <p>{fileInfo.numericCount} מספרים רגילים, {fileInfo.alphanumericCount} מספרים מיוחדים</p>
                    {fileInfo.encoding && (
                      <p>קידוד שזוהה: {fileInfo.encoding}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {!csvContent && !isLoading && (
          <div className="text-xs flex items-center gap-1 text-amber-600 mt-2">
            <AlertCircle className="h-3 w-3" />
            <span>טרם הועלה קובץ למערכת</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvImportField;
