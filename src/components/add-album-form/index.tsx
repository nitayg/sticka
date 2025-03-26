import { useState, useEffect } from "react";
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
import { addAlbum, updateAlbum } from "@/lib/album-operations"; // הוספתי ייבוא של updateAlbum
import { importStickersFromCSV } from "@/lib/sticker-operations";
import { parseCSV } from "@/utils/csv-parser";
import { getAllAlbums } from "@/lib/data"; // הוספתי ייבוא כדי לקבל את פרטי האלבום לעריכה

interface AddAlbumFormProps {
  onAlbumAdded?: () => void;
  onCancel?: () => void; // הוספתי את הפרופ הזה
  albumId?: string; // הוספתי את הפרופ הזה כדי לתמוך בעריכה
  iconOnly?: boolean;
  children?: ReactNode;
}

const AddAlbumForm = ({ onAlbumAdded, onCancel, albumId, iconOnly = false, children }: AddAlbumFormProps) => {
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

  // טעינת נתוני אלבום קיים אם albumId מסופק
  useEffect(() => {
    if (albumId && open) {
      const albums = getAllAlbums();
      const albumToEdit = albums.find(album => album.id === albumId);
      if (albumToEdit) {
        setName(albumToEdit.name);
        setDescription(albumToEdit.description || "");
        setYear(albumToEdit.year || new Date().getFullYear().toString());
        setTotalStickers(albumToEdit.totalStickers.toString());
        setImageUrl(albumToEdit.coverImage || "");
      }
    }
  }, [albumId, open]);
  
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
      let newAlbumId = albumId || generateId(); // אם יש albumId, משתמשים בו; אחרת יוצרים חדש
      
      const albumData = {
        id: newAlbumId,
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers || "0"),
        coverImage: imageUrl,
      };
      
      // עדכון או הוספת אלבום
      if (albumId) {
        await updateAlbum(albumData); // עדכון אלבום קיים
        console.log("Album updated successfully:", albumData);
      } else {
        await addAlbum(albumData); // הוספת אלבום חדש
        console.log("Album created successfully:", albumData);
      }
      
      // Keep track if we imported any stickers
      let stickersImported = false;
      let importedCount = 0;
      
      // Process CSV data if provided (רק בעת יצירת אלבום חדש)
      if (csvContent && !albumId) {
        try {
          console.log("Processing CSV content, length:", csvContent.length);
          
          // Parse CSV data
          const parsedData = parseCSV(csvContent);
          console.log("Parsed CSV data:", parsedData);
          
          if (parsedData && parsedData.length > 0) {
            // Format data as [number, name, team] triplets
            const importData: [number, string, string][] = [];
            
            // Process data from parser - handle parsed data in the expected format
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
                // For object format with parsed fields
                const rowObj = row as { number: number; name: string; team: string };
                const number = rowObj.number || 0;
                const name = rowObj.name || "";
                const team = rowObj.team || "";
                
                if (number > 0) {
                  importData.push([number, name, team]);
                }
              }
            });
            
            console.log("Formatted import data:", importData);
            
            // Only import if we have valid data
            if (importData.length > 0) {
              console.log("Importing stickers:", importData);
              const importedStickers = await importStickersFromCSV(newAlbumId, importData);
              importedCount = importedStickers.length;
              
              if (importedStickers.length > 0) {
                stickersImported = true;
                console.log(`Successfully imported ${importedStickers.length} stickers`);
                
                toast({
                  title: "מדבקות יובאו בהצלחה",
                  description: `יובאו ${importedStickers.length} מדבקות לאלבום`,
                });
              } else {
                console.warn("No stickers were imported");
                toast({
                  title: "אזהרה",
                  description: "לא יובאו מדבקות לאלבום",
                  variant: "destructive",
                });
              }
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
      
      // Select the new album automatically (רק בעת יצירת אלבום חדש)
      if (!albumId) {
        handleAlbumChange(newAlbumId);
      }
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      toast({
        title: albumId ? "אלבום עודכן בהצלחה" : "אלבום נוסף בהצלחה",
        description: albumId 
          ? `האלבום "${name}" עודכן בהצלחה`
          : `האלבום "${name}" נוסף בהצלחה${stickersImported ? ` ו-${importedCount} מדבקות יובאו` : ''}`,
      });
      
      // Run the callback if provided
      if (onAlbumAdded) {
        onAlbumAdded();
      }
      
      // Force refresh to ensure components get updated - use multiple events
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
      
      // Trigger sticker data changed event specifically for this album
      if (!albumId) {
        window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
          detail: { albumId: newAlbumId, count: importedCount } 
        }));
      }
      
      // Add a small delay and refresh again to ensure stickers are loaded
      setTimeout(() => {
        console.log("Triggering delayed refresh events");
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        if (!albumId) {
          window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
            detail: { albumId: newAlbumId, count: importedCount } 
          }));
        }
      }, 500);
      
      // Add another longer delay for final refresh
      setTimeout(() => {
        console.log("Triggering final refresh events");
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
        
        if (stickersImported && !albumId) {
          window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
            detail: { albumId: newAlbumId, count: importedCount } 
          }));
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error adding/updating album:", error);
      toast({
        title: "שגיאה בעדכון/הוספת אלבום",
        description: "אירעה שגיאה בעת עדכון/הוספת האלבום",
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
          <DialogTitle>{albumId ? "עריכת אלבום" : "הוספת אלבום חדש"}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">פרטי אלבום</TabsTrigger>
            <TabsTrigger value="image">תמונה</TabsTrigger>
            <TabsTrigger value="csv" disabled={!!albumId}>ייבוא מדבקות</TabsTrigger>
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
        
        <div className="flex justify-between mt-4">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-interactive hover:bg-interactive-hover text-interactive-foreground"
          >
            {isSubmitting ? (albumId ? "מעדכן אלבום..." : "מוסיף אלבום...") : (albumId ? "עדכן אלבום" : "הוסף אלבום")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
