
import { Album } from "@/lib/types";
import { Button } from "../ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddStickerForm from "../AddStickerForm";
import ViewModeToggle from "../ViewModeToggle";
import ImportExcelDialog from "../ImportExcelDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { addAlbum } from "@/lib/album-operations";
import { useToast } from "../ui/use-toast";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onImportComplete?: () => void;
}

const AlbumHeader = ({ 
  albums, 
  selectedAlbum, 
  viewMode, 
  setViewMode, 
  onRefresh,
  onImportComplete
}: AlbumHeaderProps) => {
  const [albumName, setAlbumName] = useState("");
  const [totalStickers, setTotalStickers] = useState<number>(0);
  const { toast } = useToast();

  const handleAddAlbum = () => {
    if (!albumName.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם אלבום",
        variant: "destructive"
      });
      return;
    }
    
    if (totalStickers <= 0) {
      toast({
        title: "שגיאה",
        description: "כמות המדבקות חייבת להיות מספר חיובי",
        variant: "destructive"
      });
      return;
    }
    
    const newAlbum = addAlbum({
      name: albumName,
      totalStickers: totalStickers,
      description: "",
    });
    
    toast({
      title: "אלבום נוסף בהצלחה",
      description: `האלבום "${albumName}" נוסף בהצלחה`
    });
    
    setAlbumName("");
    setTotalStickers(0);
    onRefresh();
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-2" dir="rtl">
      <h1 className="text-2xl font-bold">אלבום המדבקות</h1>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          רענון
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              הוסף אלבום
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>הוספת אלבום חדש</DialogTitle>
              <DialogDescription>
                הוסף אלבום חדש לאוסף שלך.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">שם האלבום</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total" className="text-right">כמות מדבקות</Label>
                <Input 
                  id="total" 
                  type="number" 
                  className="col-span-3" 
                  value={totalStickers || ""}
                  onChange={(e) => setTotalStickers(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddAlbum}>הוסף אלבום</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <ImportExcelDialog 
          albums={albums} 
          selectedAlbum={selectedAlbum} 
          setSelectedAlbum={() => {}} // This is a no-op because we don't want to change the album
          onImportComplete={onImportComplete}
        />
        
        <AddStickerForm 
          onStickerAdded={onRefresh}
          defaultAlbumId={selectedAlbum}
        />
        
        <div className="mr-2">
          <ViewModeToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;
