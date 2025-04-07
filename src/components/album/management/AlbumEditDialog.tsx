
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AlbumBasicInfo from "@/components/add-album-form/AlbumBasicInfo";
import AlbumImageUploader from "@/components/add-album-form/AlbumImageUploader";
import { useToast } from "@/components/ui/use-toast";
import { updateAlbum } from "@/lib/album-operations";
import { Album } from "@/lib/types";

interface AlbumEditDialogProps {
  album: Album | null;
  onClose: () => void;
}

const AlbumEditDialog = ({ album, onClose }: AlbumEditDialogProps) => {
  const [name, setName] = useState(album?.name || "");
  const [description, setDescription] = useState(album?.description || "");
  const [year, setYear] = useState(album?.year || "");
  const [totalStickers, setTotalStickers] = useState(album?.totalStickers?.toString() || "");
  const [imageUrl, setImageUrl] = useState(album?.coverImage || "");
  const { toast } = useToast();

  const saveAlbumEdits = async () => {
    if (!album) return;
    
    try {
      await updateAlbum(album.id, {
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
      
      onClose();
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
    <Dialog open={!!album} onOpenChange={(open) => !open && onClose()}>
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
  );
};

export default AlbumEditDialog;
