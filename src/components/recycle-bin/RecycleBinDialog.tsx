
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Recycle, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { 
  getRecycleBin, 
  restoreAlbumFromRecycleBin, 
  deleteAlbumPermanently, 
  emptyRecycleBin,
  RecycledItem
} from "@/lib/recycle-bin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface RecycleBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecycleBinDialog = ({ open, onOpenChange }: RecycleBinDialogProps) => {
  const { toast } = useToast();
  const [recycleBinItems, setRecycleBinItems] = useState<RecycledItem[]>([]);
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);
  
  // טען את פריטי סל המיחזור בעת טעינת הרכיב או כאשר סל המיחזור משתנה
  useEffect(() => {
    const loadRecycleBin = () => {
      const items = getRecycleBin();
      setRecycleBinItems(items);
    };
    
    // טען נתונים ראשוניים
    loadRecycleBin();
    
    // האזן לשינויים בסל המיחזור
    const handleRecycleBinChange = () => {
      loadRecycleBin();
    };
    
    window.addEventListener('recycleBinChanged', handleRecycleBinChange);
    
    return () => {
      window.removeEventListener('recycleBinChanged', handleRecycleBinChange);
    };
  }, []);

  // פונקציות לעבודה עם פריטים בסל המיחזור
  const handleRestoreAlbum = (albumId: string) => {
    restoreAlbumFromRecycleBin(albumId);
    toast({
      title: "אלבום שוחזר",
      description: "האלבום שוחזר בהצלחה",
    });
  };
  
  const handleDeletePermanently = (albumId: string) => {
    deleteAlbumPermanently(albumId);
    toast({
      title: "אלבום נמחק",
      description: "האלבום נמחק לצמיתות",
      variant: "destructive",
    });
  };
  
  const handleEmptyRecycleBin = () => {
    emptyRecycleBin();
    setIsConfirmEmptyOpen(false);
    toast({
      title: "סל המיחזור רוקן",
      description: "כל הפריטים נמחקו לצמיתות",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-green-500" />
            סל המיחזור
          </DialogTitle>
          <DialogDescription>
            פריטים שנמחקו יישמרו כאן למשך 30 יום. אחרי זה, הם יימחקו לצמיתות.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {recycleBinItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
              <Recycle className="h-12 w-12 text-muted-foreground/60" />
              <h3 className="text-lg font-medium">סל המיחזור ריק</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                פריטים שתמחק יופיעו כאן ויהיו ניתנים לשחזור למשך 30 יום.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recycleBinItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.item.name}</CardTitle>
                    <CardDescription>
                      נמחק לפני {formatDistanceToNow(item.deletedAt, { locale: he, addSuffix: false })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">כולל {item.relatedStickers.length} מדבקות</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 ml-1" />
                          מחק לצמיתות
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>מחיקה לצמיתות</AlertDialogTitle>
                          <AlertDialogDescription>
                            האם אתה בטוח שברצונך למחוק לצמיתות את האלבום "{item.item.name}"? פעולה זו לא ניתנת לביטול.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse justify-start">
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeletePermanently(item.id)}
                          >
                            מחק לצמיתות
                          </AlertDialogAction>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRestoreAlbum(item.id)}
                    >
                      <RotateCcw className="h-4 w-4 ml-1" />
                      שחזר
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-row-reverse sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            סגור
          </Button>
          
          {recycleBinItems.length > 0 && (
            <AlertDialog open={isConfirmEmptyOpen} onOpenChange={setIsConfirmEmptyOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 ml-1" />
                  רוקן את סל המיחזור
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>ריקון סל המיחזור</AlertDialogTitle>
                  <AlertDialogDescription>
                    האם אתה בטוח שברצונך לרוקן את סל המיחזור? כל הפריטים יימחקו לצמיתות ולא יהיה ניתן לשחזר אותם.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse justify-start">
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleEmptyRecycleBin}
                  >
                    רוקן
                  </AlertDialogAction>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecycleBinDialog;
