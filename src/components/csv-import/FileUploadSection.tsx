
import { ParsedCsvRow } from "@/utils/csv-parser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  isLoading: boolean;
  parseFile: (file: File) => Promise<void>;
}

export const FileUploadSection = ({ 
  file, 
  setFile, 
  isLoading,
  parseFile 
}: FileUploadSectionProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await parseFile(selectedFile);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="stickers-file">קובץ מדבקות</Label>
      <Input 
        id="stickers-file" 
        type="file" 
        accept=".csv,.xlsx,.xls,.txt" 
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <p className="text-sm text-muted-foreground mt-1">
        פורמט: מספר מדבקה, שם שחקן, שם קבוצה (תומך בקידוד UTF-8 ו-Windows-1255)
      </p>
      {file && (
        <FileInfo file={file} />
      )}
    </div>
  );
};

interface FileInfoProps {
  file: File;
}

const FileInfo = ({ file }: FileInfoProps) => {
  return (
    <div className="text-sm text-green-600 mt-2">
      נבחר קובץ: {file.name}
    </div>
  );
};
