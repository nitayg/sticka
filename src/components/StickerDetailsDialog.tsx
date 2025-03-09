
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Sticker } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker, deleteSticker } from "@/lib/sticker-operations";
import { getAlbumById } from "@/lib/album-operations";
import EditStickerForm from "./edit-sticker-form";
import StickerInfo from "./sticker-details/StickerInfo";
import ImageUploadUrl from "./sticker-details/ImageUploadUrl";
import ImageUploadFile from "./sticker-details/ImageUploadFile";
import StickerActions from "./sticker-details/StickerActions";
import StickerImage from "./sticker-details/StickerImage";
import { useInventoryStore } from "@/store/useInventoryStore";

interface StickerDetailsDialogProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StickerDetailsDialog = ({ sticker, isOpen, onClose, onUpdate }: StickerDetailsDialogProps) => {
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  const { transactionMap } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'info' | 'image'>('info');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (sticker) {
      setShowEditForm(false);
      setIsDeleting(false);
      setIsLoading(false);
    }
  }, [sticker]);
  
  if (!sticker) return null;
  
  const album = getAlbumById(sticker.albumId);
  const fallbackImage = album?.coverImage;
  
  // Check if this sticker is part of a transaction
  const transaction = sticker ? transactionMap[sticker.id] : undefined;
  
  const handleImageUrlUpdate = async (imageUrl: string) => {
    setIsLoading(true);
    try {
      await updateSticker(sticker.id, { imageUrl });
      toast({
        title: "תמונה עודכנה",
        description: "תמונת המדבקה עודכנה בהצלחה",
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "שגיאה בעדכון התמונה",
        description: "אירעה שגיאה בעת עדכון תמונת המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleOwned = async () => {
    setIsLoading(true);
    try {
      await toggleStickerOwned(sticker.id);
      toast({
        title: sticker.isOwned ? "מדבקה סומנה כחסרה" : "מדבקה סומנה כנאספה",
        description: `מדבקה ${sticker.number} - ${sticker.name} עודכנה בהצלחה`,
      });
      onUpdate();
      
      // אם מסירים מהאוסף, סוגרים את החלון
      if (sticker.isOwned) {
        onClose();
      }
    } catch (error) {
      console.error("Error toggling owned status:", error);
      toast({
        title: "שגיאה בעדכון הסטטוס",
        description: "אירעה שגיאה בעת עדכון סטטוס המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDuplicate = async () => {
    setIsLoading(true);
    try {
      await toggleStickerDuplicate(sticker.id);
      toast({
        title: sticker.isDuplicate ? "מדבקה סומנה כיחידה" : "מדבקה סומנה ככפולה",
        description: `מדבקה ${sticker.number} - ${sticker.name} עודכנה בהצלחה`,
      });
      onUpdate();
    } catch (error) {
      console.error("Error toggling duplicate status:", error);
      toast({
        title: "שגיאה בעדכון הסטטוס",
        description: "אירעה שגיאה בעת עדכון סטטוס הכפילות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !sticker) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteSticker(sticker.id);
      
      if (success) {
        toast({
          title: "מדבקה נמחקה",
          description: `מדבקה ${sticker.number} - ${sticker.name} נמחקה בהצלחה`,
        });
        onUpdate();
        onClose();
      } else {
        throw new Error("Failed to delete sticker");
      }
    } catch (error) {
      console.error("Error deleting sticker:", error);
      toast({
        title: "שגיאה במחיקת המדבקה",
        description: "אירעה שגיאה בעת מחיקת המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="pb-1">
            <DialogTitle>פרטי מדבקה</DialogTitle>
            <DialogDescription>
              מדבקה מספר {sticker.number} - {sticker.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-start">
              {/* Left column with image */}
              <div className="w-1/3 flex-shrink-0">
                <StickerImage 
                  imageUrl={sticker.imageUrl} 
                  fallbackImage={fallbackImage} 
                  alt={sticker.name} 
                  inTransaction={!!transaction}
                  transactionColor={transaction?.color}
                  transactionPerson={transaction?.person}
                  isRecentlyAdded={false}
                />
              </div>
              
              {/* Right column with info */}
              <div className="flex-1">
                <StickerInfo sticker={sticker} />
                
                {transaction && (
                  <div className={`p-2 rounded-md my-2 ${transaction.color} border border-border`}>
                    <h4 className="text-sm font-semibold">פרטי החלפה</h4>
                    <p className="text-xs">
                      <span className="font-medium">אדם: </span>
                      {transaction.person}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <StickerActions 
              sticker={sticker}
              onToggleOwned={handleToggleOwned}
              onToggleDuplicate={handleToggleDuplicate}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              isLoading={isLoading}
            />
            
            {/* Image upload section (simplified) */}
            <details className="text-xs">
              <summary className="cursor-pointer font-medium py-1">
                ניהול תמונות
              </summary>
              <div className="pt-1 space-y-2">
                <ImageUploadUrl onUpload={handleImageUrlUpdate} />
                <ImageUploadFile onUpload={handleImageUrlUpdate} />
              </div>
            </details>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} size="sm">
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
