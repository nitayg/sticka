
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteAlbum } from "@/lib/album-operations";

interface AlbumDeleteDialogProps {
  albumId: string | null;
  albumName?: string;
  onClose: () => void;
  onAlbumDeleted: (deletedAlbumId: string) => void;
}

const AlbumDeleteDialog = ({ 
  albumId, 
  albumName, 
  onClose, 
  onAlbumDeleted 
}: AlbumDeleteDialogProps) => {
  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!albumId) return;
    
    try {
      await deleteAlbum(albumId);
      
      toast({
        title: "אלבום נמחק בהצלחה",
        description: "האלבום נמחק בהצלחה מהמערכת",
      });
      
      // Notify parent component about the deletion
      onAlbumDeleted(albumId);
      
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
      onClose();
    }
  };

  return (
    <Dialog open={!!albumId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle>מחיקת אלבום{albumName ? ` "${albumName}"` : ""}</DialogTitle>
          <DialogDescription>
            פעולה זו לא ניתנת לביטול. האלבום וכל המדבקות שלו יימחקו לצמיתות.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
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
  );
};

export default AlbumDeleteDialog;
