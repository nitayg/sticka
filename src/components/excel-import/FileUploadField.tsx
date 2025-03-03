
import React, { ChangeEvent, Ref } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface FileUploadFieldProps {
  onFileChange: (file: File) => void;
  fileInputRef: Ref<HTMLInputElement>;
}

const FileUploadField = ({ onFileChange, fileInputRef }: FileUploadFieldProps) => {
  const { toast } = useToast();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
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
          accept=".csv,.txt" 
          onChange={handleFileUpload} 
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};

export default FileUploadField;
