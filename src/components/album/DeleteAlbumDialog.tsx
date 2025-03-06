
import React from "react";
import { Trash2, AlertCircle, ArchiveRestore } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Album } from "@/lib/types";
import { deleteAlbum } from "@/lib/album-operations";
import { useToast } from "@/components/ui/use-toast";

interface DeleteAlbumDialogProps {
  album: Album | null;
  onClose: () => void;
  onConfirm: () => void;
  mode: "recycle" | "delete";
}

const DeleteAlbumDialog = ({
  album,
  onClose,
  onConfirm,
  mode = "recycle"
}: DeleteAlbumDialogProps) => {
  const { toast } = useToast();
  
  if (!album) return null;
  
  const handleConfirm = () => {
    // מחק את האלבום או העבר לסל המיחזור בהתאם למצב
    const moveToRecycleBin = mode === "recycle";
    const success = deleteAlbum(album.id, moveToRecycleBin);
    
    if (success) {
      toast({
        title: moveToRecycleBin ? "האלבום הועבר לסל המיחזור" : "האלבום נמחק לצמיתות",
        description: moveToRecycleBin 
          ? "ניתן לשחזר את האלבום מסל המיחזור" 
          : "לא ניתן לשחזר את האלבום שנמחק",
        variant: moveToRecycleBin ? "default" : "destructive",
      });
      onConfirm();
    } else {
      toast({
        title: "שגיאה במחיקת האלבום",
        description: "אירעה שגיאה בעת מחיקת האלבום",
        variant: "destructive",
      });
    }
    
    onClose();
  };

  return (
    <AlertDialog open={!!album} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {mode === "recycle" ? (
              <><ArchiveRestore className="h-5 w-5 text-amber-500" /> העברה לסל המיחזור</>
            ) : (
              <><Trash2 className="h-5 w-5 text-destructive" /> מחיקת אלבום לצמיתות</>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            האם אתה בטוח שברצונך {mode === "recycle" ? "להעביר לסל המיחזור" : "למחוק לצמיתות"} את האלבום <span className="font-semibold text-foreground">{album.name}</span>?
            
            {mode === "recycle" ? (
              <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800 mt-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  האלבום יועבר לסל המיחזור. תוכל לשחזר אותו בכל עת מתפריט סל המיחזור.
                </div>
              </div>
            ) : (
              <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800 mt-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  פעולה זו היא לצמיתות ולא ניתן לשחזר את האלבום לאחר מחיקתו.
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row-reverse gap-2">
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={mode === "recycle" ? "bg-amber-500 hover:bg-amber-600" : "bg-destructive hover:bg-destructive/90"}
          >
            {mode === "recycle" ? "העבר לסל המיחזור" : "מחק לצמיתות"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlbumDialog;
