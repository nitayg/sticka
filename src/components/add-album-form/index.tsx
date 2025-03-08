
import { useState, ReactNode } from "react";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlbumBasicInfo from "./AlbumBasicInfo";
import CsvImportField from "./CsvImportField";
import AlbumImageUploader from "./AlbumImageUploader";
import { generateId } from "@/lib/utils";
import { useAlbumStore } from "@/store/useAlbumStore";
import { useToast } from "@/components/ui/use-toast";
import { addAlbum } from "@/lib/album-operations";
import { importStickersFromCSV } from "@/lib/sticker-operations";
import { parseCSV } from "@/utils/csv-parser";

interface AddAlbumFormProps {
  onAlbumAdded?: () => void;
  iconOnly?: boolean;
  children?: ReactNode;
}

const AddAlbumForm = ({ onAlbumAdded, iconOnly = false, children }: AddAlbumFormProps) => {
  const [open, setOpen] = useState(false);
  const { handleAlbumChange } = useAlbumStore();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [totalStickers, setTotalStickers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: "שם אלבום חסר",
        description: "יש להזין שם אלבום",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create album
      const newAlbumId = generateId();
      const newAlbum = {
        id: newAlbumId,
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers || "0"),
        coverImage: imageUrl,
      };
      
      // Add album to storage
      await addAlbum(newAlbum);
      
      // Process CSV data if available
      if (csvContent) {
        try {
          // Parse CSV content
          const parsedData = parseCSV(csvContent);
          
          if (parsedData && parsedData.length > 0) {
            // Map to format expected by importStickersFromCSV
            const importData: [number, string, string][] = parsedData.map(row => {
              // Handle different CSV formats by looking at the row structure
              if (Array.isArray(row) && row.length >= 3) {
                // If already in array format with 3+ items
                const number = parseInt(row[0].toString());
                return [number, row[1].toString(), row[2].toString()];
              } else if (typeof row === 'object') {
                // If in object format with named properties
                const number = parseInt((row.number || row.Number || row.num || "0").toString());
                const name = (row.name || row.Name || row.title || "").toString();
                const team = (row.team || row.Team || row.group || "").toString();
                return [number, name, team];
              } else {
                // Fallback for unexpected formats
                return [0, "", ""];
              }
            }).filter(row => row[0] > 0); // Filter out invalid rows
            
            // Import the stickers
            if (importData.length > 0) {
              const importedStickers = importStickersFromCSV(newAlbumId, importData);
              
              // Show success toast for imported stickers
              toast({
                title: "מדבקות יובאו בהצלחה",
                description: `יובאו ${importedStickers.length} מדבקות לאלבום`,
              });
            }
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          toast({
            title: "שגיאה בייבוא מדבקות",
            description: "אירעה שגיאה בעת ייבוא המדבקות מהקובץ",
            variant: "destructive",
          });
        }
      }
      
      // Set the newly created album as the selected album
      handleAlbumChange(newAlbumId);
      
      // Close the dialog and reset form
      setOpen(false);
      setName("");
      setDescription("");
      setYear(new Date().getFullYear().toString());
      setTotalStickers("");
      setImageUrl("");
      setCsvContent("");
      
      // Show success toast
      toast({
        title: "אלבום נוסף בהצלחה",
        description: `האלבום "${name}" נוסף בהצלחה`,
      });
      
      // Call callback if provided
      if (onAlbumAdded) {
        onAlbumAdded();
      }
    } catch (error) {
      console.error("Error adding album:", error);
      toast({
        title: "שגיאה בהוספת אלבום",
        description: "אירעה שגיאה בעת הוספת האלבום",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const trigger = iconOnly ? (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10 rounded-full bg-gray-800"
    >
      <Plus className="h-5 w-5" />
    </Button>
  ) : children || (
    <Button>
      <Plus className="h-4 w-4 ml-2" />
      הוסף אלבום
    </Button>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת אלבום חדש</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">פרטי אלבום</TabsTrigger>
            <TabsTrigger value="image">תמונה</TabsTrigger>
            <TabsTrigger value="csv">ייבוא מדבקות</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-2">
            <AlbumBasicInfo
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              year={year}
              setYear={setYear}
              totalStickers={totalStickers}
              setTotalStickers={setTotalStickers}
            />
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4 mt-2">
            <AlbumImageUploader
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
            />
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4 mt-2">
            <CsvImportField
              csvContent={csvContent}
              setCsvContent={setCsvContent}
            />
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full mt-4 bg-interactive hover:bg-interactive-hover text-interactive-foreground"
        >
          {isSubmitting ? "מוסיף אלבום..." : "הוסף אלבום"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
