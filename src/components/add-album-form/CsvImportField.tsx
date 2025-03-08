
import React, { useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface CsvImportFieldProps {
  csvContent: string;
  setCsvContent: (content: string) => void;
}

const CsvImportField = ({ csvContent, setCsvContent }: CsvImportFieldProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        
        // Quick validation of content
        const lines = content.split('\n').filter(line => line.trim().length > 0);
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
      };
      
      reader.readAsText(selectedFile);
    }
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="file">העלאת קובץ CSV</Label>
      <div className="space-y-1">
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
        {csvContent && (
          <p className="text-xs text-green-500 text-right">
            הקובץ נטען בהצלחה ומוכן לייבוא.
          </p>
        )}
      </div>
    </div>
  );
};

export default CsvImportField;
