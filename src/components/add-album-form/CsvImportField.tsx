
import React, { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { AlertCircle, FileText } from "lucide-react";

interface CsvImportFieldProps {
  csvContent: string;
  setCsvContent: (content: string) => void;
}

const CsvImportField = ({ csvContent, setCsvContent }: CsvImportFieldProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv' && fileExtension !== 'txt') {
        toast({
          title: "סוג קובץ לא נתמך",
          description: "אנא העלה קובץ CSV או TXT",
          variant: "destructive",
          duration: 3000,
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFileName(null);
        setLineCount(null);
        setCsvContent('');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
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
        
        // Sample a few lines to show in the console for debugging
        const sampleLines = lines.slice(0, 5);
        console.log("CSV Sample lines:", sampleLines);
        
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
            description: `${selectedFile.name} מוכן לייבוא עם ${lines.length} שורות.`,
            duration: 3000,
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "שגיאה בקריאת הקובץ",
          description: "אירעה שגיאה בעת קריאת הקובץ. אנא נסה שוב.",
          variant: "destructive",
          duration: 3000,
        });
        setFileName(null);
        setLineCount(null);
      };
      
      reader.readAsText(selectedFile);
    }
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCsvContent('');
    setFileName(null);
    setLineCount(null);
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
        />
        <p className="text-xs text-muted-foreground text-right">
          פורמט הקובץ: מספר, שם, קבוצה/סדרה בכל שורה. 
          המערכת תזהה באופן אוטומטי שורת כותרת אם קיימת.
        </p>
        
        {csvContent && fileName && (
          <div className="bg-muted/50 p-3 rounded-md mt-2">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFile}
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
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span>הקובץ מכיל {lineCount} שורות מוכנות לייבוא</span>
              </p>
            )}
          </div>
        )}
        
        {!csvContent && (
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
