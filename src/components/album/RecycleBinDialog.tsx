
import React, { useState } from "react";
import { Trash2, ArchiveRestore, AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Album } from "@/lib/types";
import { getRecycledAlbums, restoreAlbum, permanentlyDeleteAlbum, clearRecycleBin } from "@/lib/album-operations";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import DeleteAlbumDialog from "./DeleteAlbumDialog";

interface RecycleBinDialogProps {
  onAction?: () => void;
}

const RecycleBinDialog = ({ onAction }: RecycleBinDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // מקבל את האלבומים מסל המיחזור
  const recycledAlbums = getRecycledAlbums();
  
  const handleRestore = (album: Album) => {
    const success = restoreAlbum(album.id);
    
    if (success) {
      toast({
        title: "האלבום שוחזר בהצלחה",
        description: `האלבום "${album.name}" שוחזר וחזר לרשימת האלבומים שלך.`,
      });
      // מרענן את הרשימה
      setRefreshKey(prev => prev + 1);
      if (onAction) onAction();
    } else {
      toast({
        title: "שגיאה בשחזור האלבום",
        description: "אירעה שגיאה בעת שחזור האלבום",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClick = (album: Album) => {
    setAlbumToDelete(album);
  };
  
  const handleClearRecycleBin = () => {
    const success = clearRecycleBin();
    
    if (success) {
      toast({
        title: "סל המיחזור רוקן בהצלחה",
        description: "כל האלבומים בסל המיחזור נמחקו לצמיתות",
      });
      // מרענן את הרשימה
      setRefreshKey(prev => prev + 1);
      if (onAction) onAction();
    } else {
      toast({
        title: "שגיאה בריקון סל המיחזור",
        description: "אירעה שגיאה בעת ריקון סל המיחזור",
        variant: "destructive",
      });
    }
  };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Trash2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">סל המיחזור ריק</h3>
      <p className="text-muted-foreground mt-1 max-w-md">
        אלבומים שהעברת לסל המיחזור יופיעו כאן. תוכל לשחזר אותם או למחוק אותם לצמיתות.
      </p>
    </div>
  );

  return (
    <>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant="outline" size="sm" className="gap-2 text-amber-500">
          <Trash2 className="h-4 w-4" />
          סל המיחזור
          {recycledAlbums.length > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {recycledAlbums.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>סל המיחזור</DialogTitle>
            <DialogDescription>
              האלבומים שהעברת לסל המיחזור נשמרים כאן זמנית. תוכל לשחזר אותם או למחוק אותם לצמיתות.
            </DialogDescription>
          </DialogHeader>
          
          {recycledAlbums.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4 mt-3">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-0.5">
                {recycledAlbums.map(album => (
                  <div 
                    key={album.id}
                    className="flex items-center justify-between bg-card p-3 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      {album.coverImage ? (
                        <img 
                          src={album.coverImage} 
                          alt={album.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          <Trash2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{album.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {album.totalStickers} מדבקות
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-2 text-green-500"
                        onClick={() => handleRestore(album)}
                      >
                        <ArchiveRestore className="h-4 w-4" />
                        <span className="sr-only">שחזר</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-2 text-destructive"
                        onClick={() => handleDeleteClick(album)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">מחק לצמיתות</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  {recycledAlbums.length} אלבומים בסל המיחזור
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleClearRecycleBin}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  רוקן את סל המיחזור
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                סגור
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* דיאלוג אישור מחיקה */}
      {albumToDelete && (
        <DeleteAlbumDialog
          album={albumToDelete}
          onClose={() => setAlbumToDelete(null)}
          onConfirm={() => {
            setRefreshKey(prev => prev + 1);
            if (onAction) onAction();
          }}
          mode="delete"
        />
      )}
    </>
  );
};

export default RecycleBinDialog;
