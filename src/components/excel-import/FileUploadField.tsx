
import React, { ChangeEvent, Ref } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface FileUploadFieldProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUploadField = ({ file, setFile }: FileUploadFieldProps) => {
  const { toast } = useToast();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "הקובץ נקלט בהצלחה",
        description: `${selectedFile.name} מוכן לייבוא.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="file" className="text-right">בחר קובץ</Label>
      <div className="col-span-3">
        <Input 
          id="file" 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default FileUploadField;
