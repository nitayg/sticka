
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { ImportForm } from "./ImportForm";
import { ParsedCsvRow } from "@/utils/csv-parser";

interface CSVImportDialogProps {
  albumId: string;
  onImportComplete: () => void;
}

export const CSVImportDialog = ({ albumId, onImportComplete }: CSVImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[] | null>(null);

  const handleImportComplete = () => {
    setOpen(false);
    setParsedData(null);
    onImportComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon className="h-4 w-4 ml-2" />
          ייבוא מדבקות
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ייבוא מדבקות מקובץ</DialogTitle>
          <DialogDescription>
            העלה קובץ CSV עם מדבקות בפורמט הבא: מספר, שם, קבוצה
          </DialogDescription>
        </DialogHeader>
        
        <ImportForm 
          albumId={albumId} 
          onImportComplete={handleImportComplete}
          parsedData={parsedData}
          setParsedData={setParsedData}
        />
      </DialogContent>
    </Dialog>
  );
};
