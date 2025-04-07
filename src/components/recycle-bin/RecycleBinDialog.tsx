
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Album } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Recycle, Trash, RotateCcw } from "lucide-react";
import { getRecycleBinAlbums, restoreAlbumFromRecycleBin, deleteAlbumPermanently } from "@/lib/recycle-bin";
import { useToast } from "@/components/ui/use-toast";
import RecycleBinItem from "./RecycleBinItem";

interface RecycleBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecycleBinDialog = ({ open, onOpenChange }: RecycleBinDialogProps) => {
  const [recycleBinItems, setRecycleBinItems] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const loadRecycleBinItems = async () => {
    setIsLoading(true);
    try {
      const items = await getRecycleBinAlbums();
      setRecycleBinItems(items);
    } catch (error) {
      console.error("Error loading recycle bin items:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      loadRecycleBinItems();
    }
  }, [open]);
  
  const handleRestore = async (albumId: string) => {
    try {
      await restoreAlbumFromRecycleBin(albumId);
      await loadRecycleBinItems();
      
      toast({
        title: "האלבום שוחזר",
        description: "האלבום שוחזר בהצלחה",
      });
      
      // Trigger a refresh of the main app view
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
    } catch (error) {
      console.error("Error restoring album:", error);
      toast({
        title: "שגיאה בשחזור",
        description: "אירעה שגיאה בשחזור האלבום",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (albumId: string) => {
    try {
      await deleteAlbumPermanently(albumId);
      await loadRecycleBinItems();
      
      toast({
        title: "האלבום נמחק לצמיתות",
        description: "האלבום נמחק לצמיתות מהמערכת",
      });
    } catch (error) {
      console.error("Error deleting album permanently:", error);
      toast({
        title: "שגיאה במחיקה",
        description: "אירעה שגיאה במחיקת האלבום",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            סל מיחזור
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              טוען פריטים...
            </div>
          ) : recycleBinItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              סל המיחזור ריק
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border p-2">
              <div className="space-y-2">
                {recycleBinItems.map(album => (
                  <RecycleBinItem
                    key={album.id}
                    album={album}
                    onRestore={() => handleRestore(album.id)}
                    onDelete={() => handleDelete(album.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecycleBinDialog;
