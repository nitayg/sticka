
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Sticker } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker } from "@/lib/sticker-operations";
import { getAlbumById } from "@/lib/album-operations";
import EditStickerForm from "./edit-sticker-form";
import StickerInfo from "./sticker-details/StickerInfo";
import ImageUploadUrl from "./sticker-details/ImageUploadUrl";
import ImageUploadFile from "./sticker-details/ImageUploadFile";
import StickerActions from "./sticker-details/StickerActions";
import StickerImage from "./sticker-details/StickerImage";

interface StickerDetailsDialogProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StickerDetailsDialog = ({ sticker, isOpen, onClose, onUpdate }: StickerDetailsDialogProps) => {
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  
  useEffect(() => {
    if (sticker) {
      setShowEditForm(false);
    }
  }, [sticker]);
  
  if (!sticker) return null;
  
  const album = getAlbumById(sticker.albumId);
  const fallbackImage = album?.coverImage;
  
  const handleImageUrlUpdate = (imageUrl: string) => {
    updateSticker(sticker.id, { imageUrl });
    toast({
      title: "תמונה עודכנה",
      description: "תמונת המדבקה עודכנה בהצלחה",
    });
    onUpdate();
  };
  
  const handleToggleOwned = () => {
    toggleStickerOwned(sticker.id);
    toast({
      title: sticker.isOwned ? "מדבקה סומנה כחסרה" : "מדבקה סומנה כנאספה",
      description: `מדבקה ${sticker.number} - ${sticker.name} עודכנה בהצלחה`,
    });
    onUpdate();
  };
  
  const handleToggleDuplicate = () => {
    toggleStickerDuplicate(sticker.id);
    toast({
      title: sticker.isDuplicate ? "מדבקה סומנה כיחידה" : "מדבקה סומנה ככפולה",
      description: `מדבקה ${sticker.number} - ${sticker.name} עודכנה בהצלחה`,
    });
    onUpdate();
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleEditComplete = () => {
    setShowEditForm(false);
    onUpdate();
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>פרטי מדבקה</DialogTitle>
            <DialogDescription>
              מדבקה מספר {sticker.number} - {sticker.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2 order-2 md:order-1">
                <StickerInfo sticker={sticker} />
                
                <ImageUploadUrl onUpload={handleImageUrlUpdate} />
                
                <ImageUploadFile onUpload={handleImageUrlUpdate} />
              </div>
              
              <StickerImage 
                imageUrl={sticker.imageUrl} 
                fallbackImage={fallbackImage} 
                alt={sticker.name} 
              />
            </div>
            
            <StickerActions 
              sticker={sticker}
              onToggleOwned={handleToggleOwned}
              onToggleDuplicate={handleToggleDuplicate}
              onEdit={handleEditClick}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit sticker form dialog */}
      <EditStickerForm 
        sticker={sticker}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onUpdate={handleEditComplete}
      />
    </>
  );
};

export default StickerDetailsDialog;
