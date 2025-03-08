
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(selectedFile);
      
      toast({
        title: "הקובץ נקלט בהצלחה",
        description: `${selectedFile.name} מוכן לייבוא.`,
        duration: 3000,
      });
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
      </div>
    </div>
  );
};

export default CsvImportField;
