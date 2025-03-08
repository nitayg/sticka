
import { useState, ReactNode, useEffect } from "react";
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
      const newAlbumId = generateId();
      console.log("Creating new album with ID:", newAlbumId);
      
      const newAlbum = {
        id: newAlbumId,
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers || "0"),
        coverImage: imageUrl,
      };
      
      // Add album to storage and Supabase
      await addAlbum(newAlbum);
      console.log("Album created successfully:", newAlbum);
      
      // Process CSV data if provided
      if (csvContent) {
        try {
          console.log("Processing CSV content, length:", csvContent.length);
          const parsedData = parseCSV(csvContent);
          console.log("Parsed CSV data:", parsedData);
          
          if (parsedData && parsedData.length > 0) {
            // Format data as [number, name, team] triplets
            const importData: [number, string, string][] = [];
            
            // Process data from parser - supports both array and object formats
            parsedData.forEach(row => {
              if (Array.isArray(row) && row.length >= 1) {
                // For array format, values are already in the right order
                const numStr = row[0]?.toString() || "0";
                const number = parseInt(numStr) || 0;
                const name = row[1]?.toString() || "";
                const team = row[2]?.toString() || "";
                
                if (number > 0) {
                  importData.push([number, name, team]);
                }
              } else if (typeof row === 'object' && row !== null) {
                // For object format, map the keys
                const numVal = row.number || row.Number || row.num || row.NUM || "0";
                const number = parseInt(typeof numVal === 'string' ? numVal : String(numVal)) || 0;
                
                const nameVal = row.name || row.Name || row.title || row.Title || "";
                const name = String(nameVal || "");
                
                const teamVal = row.team || row.Team || row.group || row.Group || "";
                const team = String(teamVal || "");
                
                if (number > 0) {
                  importData.push([number, name, team]);
                }
              }
            });
            
            console.log("Formatted import data:", importData);
            
            // Only import if we have valid data
            if (importData.length > 0) {
              console.log("Importing stickers:", importData);
              const importedStickers = importStickersFromCSV(newAlbumId, importData);
              
              toast({
                title: "מדבקות יובאו בהצלחה",
                description: `יובאו ${importedStickers.length} מדבקות לאלבום`,
              });
            } else {
              console.warn("No valid sticker data found in CSV");
              toast({
                title: "אזהרה",
                description: "לא נמצא מידע תקין על מדבקות בקובץ",
                variant: "destructive",
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
      
      // Select the new album automatically
      handleAlbumChange(newAlbumId);
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      toast({
        title: "אלבום נוסף בהצלחה",
        description: `האלבום "${name}" נוסף בהצלחה`,
      });
      
      // Run the callback if provided
      if (onAlbumAdded) {
        onAlbumAdded();
      }
      
      // Force refresh to ensure components get updated - use multiple events and timeout to ensure proper update
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
      
      // Add a small delay and refresh again to ensure stickers are loaded
      setTimeout(() => {
        console.log("Triggering delayed refresh events");
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
          detail: { albumId: newAlbumId } 
        }));
      }, 500);
      
      // Add another longer delay for final refresh
      setTimeout(() => {
        console.log("Triggering final refresh events");
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
      }, 1500);
      
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
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setYear(new Date().getFullYear().toString());
    setTotalStickers("");
    setImageUrl("");
    setCsvContent("");
    setActiveTab("details");
  };
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
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
