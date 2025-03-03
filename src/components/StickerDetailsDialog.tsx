
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Image, Share2, PlusCircle, FileImage, XCircle } from "lucide-react";
import { Sticker } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker } from "@/lib/sticker-operations";

interface StickerDetailsDialogProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StickerDetailsDialog = ({ sticker, isOpen, onClose, onUpdate }: StickerDetailsDialogProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  
  if (!sticker) return null;
  
  const handleImageUrlUpdate = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כתובת תמונה תקינה",
        variant: "destructive",
      });
      return;
    }
    
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
  
  const shareSticker = () => {
    // בעתיד - כאן יהיה קוד להצעת החלפה
    toast({
      title: "הצעת החלפה",
      description: "פונקציונליות זו תהיה זמינה בקרוב",
    });
  };
  
  return (
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
              <div className="space-y-1">
                <Label className="text-base font-medium">מידע</Label>
                <div className="bg-secondary rounded-md p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">מספר:</span>
                    <span className="font-medium">{sticker.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">שם:</span>
                    <span className="font-medium">{sticker.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">קבוצה:</span>
                    <span className="font-medium">{sticker.team}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">קטגוריה:</span>
                    <span className="font-medium">{sticker.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">סטטוס:</span>
                    <span className="font-medium">{sticker.isOwned ? "נאספה" : "חסרה"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">כפולה:</span>
                    <span className="font-medium">{sticker.isDuplicate ? "כן" : "לא"}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-base font-medium">עדכון תמונה</Label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="הכנס כתובת URL לתמונה" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button size="sm" onClick={handleImageUrlUpdate}>
                    <FileImage className="h-4 w-4 mr-2" />
                    עדכן
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-square rounded-lg overflow-hidden border order-1 md:order-2">
              {sticker.imageUrl ? (
                <img 
                  src={sticker.imageUrl} 
                  alt={sticker.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-base font-medium">פעולות</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant={sticker.isOwned ? "destructive" : "default"} onClick={handleToggleOwned}>
                {sticker.isOwned ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    הסר מהאוסף
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    הוסף לאוסף
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleToggleDuplicate}
                disabled={!sticker.isOwned}
              >
                {sticker.isDuplicate ? "הסר סימון כפול" : "סמן ככפולה"}
              </Button>
              
              <Button variant="secondary" onClick={shareSticker}>
                <Share2 className="h-4 w-4 mr-2" />
                הצע החלפה
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StickerDetailsDialog;
