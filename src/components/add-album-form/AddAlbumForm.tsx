import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus } from "lucide-react";
import { addAlbum } from "@/lib/album-operations";
import { useToast } from "../ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { importStickersFromCSV } from "@/lib/sticker-operations";
import AlbumBasicInfo from "./AlbumBasicInfo";
import AlbumImageUploader from "./AlbumImageUploader";
import CsvImportField from "./CsvImportField";

interface AddAlbumFormProps {
  onAlbumAdded?: () => void;
}

const AddAlbumForm = ({ onAlbumAdded }: AddAlbumFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [totalStickers, setTotalStickers] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [albumImagePreview, setAlbumImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setYear("");
    setTotalStickers("");
    setFile(null);
    setAlbumImage(null);
    setAlbumImagePreview(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalStickers) {
      toast({
        title: "שדות חסרים",
        description: "אנא מלא את כל שדות החובה",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Process the album image if it exists
      let coverImageUrl = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop";
      
      if (albumImage) {
        // In a real app, we would upload the image to a server and get back a URL
        // For now, we'll use the local data URL as a demonstration
        coverImageUrl = albumImagePreview || coverImageUrl;
      }
      
      // Add the album first
      const newAlbum = await addAlbum({
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers),
        coverImage: coverImageUrl
      });
      
      // If a file was uploaded, import its contents
      if (file) {
        try {
          const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
              if (event.target?.result) {
                resolve(event.target.result as string);
              } else {
                reject(new Error("קריאת הקובץ נכשלה"));
              }
            };
            
            reader.onerror = () => {
              reject(new Error("לא ניתן לקרוא את הקובץ"));
            };
            
            reader.readAsText(file);
          });
          
          const lines = fileContent.split('\n').filter(line => line.trim());
          
          // Check if the first line looks like a header
          const firstLine = lines[0];
          const isHeader = firstLine && 
            (firstLine.toLowerCase().includes('מספר') || 
             firstLine.toLowerCase().includes('number') ||
             firstLine.toLowerCase().includes('שם') ||
             firstLine.toLowerCase().includes('name') ||
             firstLine.toLowerCase().includes('קבוצה') ||
             firstLine.toLowerCase().includes('team'));
          
          // Skip the header line if detected
          const dataLines = isHeader ? lines.slice(1) : lines;
          
          if (dataLines.length === 0) {
            throw new Error("הקובץ ריק או מכיל רק כותרות");
          }
          
          const parsedData = dataLines.map(line => {
            const parts = line.split(',').map(item => item.trim());
            
            // Check if we have at least 3 columns
            if (parts.length < 3) {
              throw new Error(`שורה לא תקינה: ${line} - נדרשים לפחות 3 שדות`);
            }
            
            const [numberStr, name, team] = parts;
            const number = parseInt(numberStr);
            
            if (isNaN(number) || !name || !team) {
              throw new Error(`שורה לא תקינה: ${line}`);
            }
            
            return [number, name, team] as [number, string, string];
          });
          
          const newStickers = importStickersFromCSV(newAlbum.id, parsedData);
          
          toast({
            title: "ייבוא הצליח",
            description: `נוצר אלבום חדש עם ${newStickers.length} מדבקות.`,
            duration: 3000,
          });
        } catch (error) {
          console.error("Import error:", error);
          toast({
            title: "האלבום נוצר, אך ייבוא המדבקות נכשל",
            description: error instanceof Error ? error.message : "אירעה שגיאה בעיבוד הקובץ",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        toast({
          title: "אלבום נוסף בהצלחה",
          description: `האלבום ${newAlbum.name} נוסף בהצלחה`,
        });
      }
      
      // Reset form
      resetForm();
      setOpen(false);
      
      // Call the callback if provided
      if (onAlbumAdded) {
        onAlbumAdded();
      }
    } catch (error) {
      console.error("Error creating album:", error);
      toast({
        title: "שגיאה ביצירת האלבום",
        description: "אירעה שגיאה בעת יצירת האלבום",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          הוסף אלבום
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת אלבום חדש</DialogTitle>
          <DialogDescription>
            הוסף אלבום חדש לאוסף שלך. שדות עם * הם שדות חובה.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">מידע בסיסי</TabsTrigger>
            <TabsTrigger value="image">תמונת אלבום</TabsTrigger>
            <TabsTrigger value="import">ייבוא מדבקות</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="basic" className="space-y-4">
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
            
            <TabsContent value="image" className="space-y-4">
              <AlbumImageUploader 
                albumImage={albumImage}
                setAlbumImage={setAlbumImage}
                albumImagePreview={albumImagePreview}
                setAlbumImagePreview={setAlbumImagePreview}
              />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <CsvImportField 
                file={file}
                setFile={setFile}
              />
            </TabsContent>
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "מוסיף אלבום..." : "הוסף אלבום"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
