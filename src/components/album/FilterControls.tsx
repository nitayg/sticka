
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddAlbumForm from "@/components/add-album-form";
import AlbumBasicInfo from "@/components/add-album-form/AlbumBasicInfo";
import AlbumImageUploader from "@/components/add-album-form/AlbumImageUploader";
import { useToast } from "@/components/ui/use-toast";
import { updateAlbum, deleteAlbum } from "@/lib/album-operations";
import AlbumCarouselGrid from "./AlbumCarouselGrid";

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
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

  const handleAlbumDelete = (albumId: string) => {
    setAlbumToDelete(albumId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!albumToDelete) return;
    
    try {
      await deleteAlbum(albumToDelete);
      
      toast({
        title: "אלבום נמחק בהצלחה",
        description: "האלבום נמחק בהצלחה מהמערכת",
      });
      
      // Select another album if the deleted one was selected
      if (albumToDelete === selectedAlbum && albums.length > 1) {
        const otherAlbum = albums.find(a => a.id !== albumToDelete);
        if (otherAlbum) {
          handleAlbumChange(otherAlbum.id);
        }
      }
      
      // Force refresh to update UI
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
      
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        title: "שגיאה במחיקת האלבום",
        description: "אירעה שגיאה בעת מחיקת האלבום",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setAlbumToDelete(null);
    }
  };

  return (
    <div>
      <AlbumCarouselGrid 
        albums={albums}
        selectedAlbumId={selectedAlbum}
        onAlbumChange={handleAlbumChange}
        onEdit={handleAlbumEdit}
      />

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת אלבום</DialogTitle>
            <DialogDescription>
              פעולה זו לא ניתנת לביטול. האלבום וכל המדבקות שלו יימחקו לצמיתות.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              ביטול
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              מחק אלבום
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterControls;
