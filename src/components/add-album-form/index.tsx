
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AlbumBasicInfo from "./AlbumBasicInfo";
import AlbumImageUploader from "./AlbumImageUploader";
import CsvImportField from "./CsvImportField";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { addAlbum } from "@/lib/album-operations";

interface AddAlbumFormProps {
  children?: ReactNode;
  iconOnly?: boolean;
  onAlbumAdded: (albumId: string) => void;
  albumId?: string;
}

const AddAlbumForm = ({ children, iconOnly = false, onAlbumAdded, albumId }: AddAlbumFormProps) => {
  const [open, setOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumImage, setAlbumImage] = useState("");
  const [csvData, setCsvData] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [totalStickers, setTotalStickers] = useState("0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetForm = () => {
    setFormStep(1);
    setAlbumName("");
    setAlbumDescription("");
    setAlbumImage("");
    setCsvData(null);
    setYear(new Date().getFullYear().toString());
    setTotalStickers("0");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const albumId = uuidv4();
      await addAlbum({
        id: albumId,
        name: albumName,
        description: albumDescription,
        coverImage: albumImage,
        totalStickers: parseInt(totalStickers) || 0,
        year: year
      });

      toast({
        title: "אלבום נוצר בהצלחה",
        description: "האלבום החדש נוצר ונוסף לרשימת האלבומים שלך.",
      });

      // Update album list
      queryClient.invalidateQueries({
        queryKey: ["albums"],
      });

      // Close dialog
      setOpen(false);
      resetForm();

      // Notify parent of new album
      onAlbumAdded(albumId);
    } catch (error) {
      console.error("Error creating album:", error);
      toast({
        title: "שגיאה ביצירת האלבום",
        description: "אירעה שגיאה בעת יצירת האלבום. אנא נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant={iconOnly ? "ghost" : "default"}
            size={iconOnly ? "icon" : "default"}
            className={iconOnly ? "h-8 w-8 rounded-full" : ""}
          >
            <Plus className={iconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
            {!iconOnly && "הוסף אלבום חדש"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת אלבום מדבקות חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי האלבום החדש שברצונך להוסיף למערכת.
          </DialogDescription>
        </DialogHeader>

        {/* Form step 1: Basic info */}
        {formStep === 1 && (
          <AlbumBasicInfo
            name={albumName}
            setName={setAlbumName}
            description={albumDescription}
            setDescription={setAlbumDescription}
            year={year}
            setYear={setYear}
            totalStickers={totalStickers}
            setTotalStickers={setTotalStickers}
          />
        )}

        {/* Form step 2: Image upload */}
        {formStep === 2 && (
          <AlbumImageUploader
            imageUrl={albumImage}
            onImageChange={setAlbumImage}
          />
        )}

        {/* Form step 3: CSV import */}
        {formStep === 3 && <CsvImportField csvContent={csvData} setCsvContent={setCsvData} />}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {formStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormStep(formStep - 1)}
            >
              הקודם
            </Button>
          )}

          {formStep < 3 && (
            <Button
              type="button"
              onClick={() => setFormStep(formStep + 1)}
              disabled={formStep === 1 && !albumName.trim()}
            >
              הבא
            </Button>
          )}

          {formStep === 3 && (
            <Button
              type="button"
              disabled={isLoading || !albumName.trim()}
              onClick={handleSubmit}
            >
              {isLoading ? "יוצר אלבום..." : "יצירת אלבום"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
