
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseCSV, ParsedCsvRow } from "@/utils/csv-parser";

interface FileUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  isLoading: boolean;
  setParsedData: (data: ParsedCsvRow[] | null) => void;
}

export const FileUploadSection = ({ 
  file, 
  setFile, 
  isLoading,
  setParsedData 
}: FileUploadSectionProps) => {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const text = await selectedFile.text();
        const parsed = parseCSV(text);
        setParsedData(parsed);
        
        if (parsed.length > 200) {
          toast({
            title: "שים לב - קובץ גדול",
            description: `קובץ מכיל ${parsed.length} רשומות. ייתכן שיש צורך לייבא בקבוצות קטנות יותר כדי להימנע ממגבלות של השרת.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "קובץ נטען",
            description: `${parsed.length} רשומות נמצאו בקובץ`,
          });
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast({
          title: "שגיאה",
          description: "שגיאה בניתוח הקובץ. ודא שהקובץ בפורמט CSV תקין",
          variant: "destructive"
        });
      }
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
        פורמט: מספר מדבקה, שם שחקן, שם קבוצה
      </p>
      {file && (
        <FileInfo file={file} parsedData={file ? null : null} />
      )}
    </div>
  );
};

interface FileInfoProps {
  file: File;
  parsedData: ParsedCsvRow[] | null;
}

const FileInfo = ({ file, parsedData }: FileInfoProps) => {
  return (
    <div className="text-sm text-green-600 mt-2">
      נבחר קובץ: {file.name}
      {parsedData && (
        <div className="mt-1 text-sm text-muted-foreground">
          {parsedData.length} רשומות זוהו בקובץ
          {parsedData.length > 200 && (
            <div className="text-orange-500 mt-1">
              אזהרה: קובץ גדול. ייתכן שתצטרך לחלק לקבצים קטנים יותר.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
