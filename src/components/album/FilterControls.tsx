
import { useState } from "react";
import { Album, PlusCircle } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AlbumGridItem from "./AlbumGridItem"; 
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddAlbumForm from "@/components/add-album-form";
import AlbumBasicInfo from "@/components/add-album-form/AlbumBasicInfo";
import AlbumImageUploader from "@/components/add-album-form/AlbumImageUploader";
import { useToast } from "@/components/ui/use-toast";
import { updateAlbum } from "@/lib/album-operations";

interface FilterControlsProps {
  albums: any[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
  onTeamsManage: () => void;
}

const FilterControls = ({ 
  albums, 
  selectedAlbum, 
  handleAlbumChange,
  onTeamsManage 
}: FilterControlsProps) => {
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [totalStickers, setTotalStickers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();

  const handleAlbumEdit = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album) {
      setEditingAlbum(album);
      setName(album.name || "");
      setDescription(album.description || "");
      setYear(album.year || "");
      setTotalStickers(album.totalStickers?.toString() || "");
      setImageUrl(album.coverImage || "");
    }
  };

  const saveAlbumEdits = async () => {
    if (!editingAlbum) return;
    
    try {
      await updateAlbum(editingAlbum.id, {
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers) || 0,
        coverImage: imageUrl
      });

      toast({
        title: "אלבום עודכן בהצלחה",
        description: `האלבום "${name}" עודכן בהצלחה`,
      });
      
      setEditingAlbum(null);
    } catch (error) {
      console.error("Error updating album:", error);
      toast({
        title: "שגיאה בעדכון האלבום",
        description: "אירעה שגיאה בעת עדכון האלבום",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pb-2 border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-3 p-1">
          {/* Add Album Button */}
          <div className="relative h-[70px] w-[70px] flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer">
            <AddAlbumForm iconOnly>
              <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground hover:text-primary transition-colors">
                <PlusCircle className="h-6 w-6" />
                <span className="text-[10px] mt-1">הוסף אלבום</span>
              </div>
            </AddAlbumForm>
          </div>
          
          {/* Album List */}
          {albums.map((album) => (
            <div className="h-[70px] w-[70px] flex-shrink-0" key={album.id}>
              <AlbumGridItem
                id={album.id}
                name={album.name}
                coverImage={album.coverImage}
                isSelected={selectedAlbum === album.id}
                onSelect={() => handleAlbumChange(album.id)}
                onEdit={handleAlbumEdit}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Album Edit Dialog */}
      <Dialog open={!!editingAlbum} onOpenChange={(open) => !open && setEditingAlbum(null)}>
        <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת אלבום</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
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
            
            <AlbumImageUploader
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
            />
            
            <Button 
              onClick={saveAlbumEdits} 
              className="w-full mt-4"
            >
              שמור שינויים
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterControls;
