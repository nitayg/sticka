
import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Sticker } from "@/lib/types";
import { updateSticker, deleteSticker } from "@/lib/sticker-operations";
import { useToast } from "../ui/use-toast";
import StickerInfo from "./StickerInfo";
import StickerActions from "./StickerActions";
import StickerImageManager from "./StickerImageManager";
import StickerEditForm from "./StickerEditForm";

interface StickerDetailsDialogProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StickerDetailsDialog = ({
  sticker,
  isOpen,
  onClose,
  onUpdate
}: StickerDetailsDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"details" | "edit">("details");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!sticker) return null;

  const handleToggleOwned = async () => {
    if (!sticker) return;
    
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        isOwned: !sticker.isOwned,
        // If we're marking as not owned, also remove duplicate status
        ...(sticker.isOwned ? { isDuplicate: false } : {})
      });
      
      onUpdate();
      
      toast({
        title: sticker.isOwned ? "המדבקה סומנה כחסרה" : "המדבקה סומנה כנאספה",
        description: sticker.isOwned 
          ? `מדבקה ${sticker.number} הוסרה מהאוסף שלך` 
          : `מדבקה ${sticker.number} נוספה לאוסף שלך`,
      });
    } catch (error) {
      console.error("Error updating sticker:", error);
      toast({
        title: "שגיאה בעדכון המדבקה",
        description: "אירעה שגיאה בעת עדכון המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDuplicate = async () => {
    if (!sticker) return;
    
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        isDuplicate: !sticker.isDuplicate
      });
      
      onUpdate();
      
      toast({
        title: sticker.isDuplicate ? "המדבקה סומנה כיחידה" : "המדבקה סומנה ככפולה",
        description: sticker.isDuplicate 
          ? `מדבקה ${sticker.number} סומנה כיחידה` 
          : `מדבקה ${sticker.number} סומנה ככפולה`,
      });
    } catch (error) {
      console.error("Error updating sticker:", error);
      toast({
        title: "שגיאה בעדכון המדבקה",
        description: "אירעה שגיאה בעת עדכון המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!sticker) return;
    
    setIsDeleting(true);
    
    try {
      await deleteSticker(sticker.id);
      
      onUpdate();
      onClose();
      
      toast({
        title: "המדבקה נמחקה בהצלחה",
        description: `מדבקה ${sticker.number} נמחקה מהמערכת`,
      });
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
  
  const handleImageUpdate = async (imageUrl: string) => {
    if (!sticker) return;
    
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        imageUrl
      });
      
      onUpdate();
      
      toast({
        title: "תמונת המדבקה עודכנה",
        description: `תמונת מדבקה ${sticker.number} עודכנה בהצלחה`,
      });
    } catch (error) {
      console.error("Error updating sticker image:", error);
      toast({
        title: "שגיאה בעדכון תמונת המדבקה",
        description: "אירעה שגיאה בעת עדכון תמונת המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "edit")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">פרטים</TabsTrigger>
            <TabsTrigger value="edit">עריכה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <StickerImageManager 
              sticker={sticker} 
              onImageUpdate={handleImageUpdate} 
            />
            
            <StickerInfo sticker={sticker} />
            
            <StickerActions 
              sticker={sticker}
              onToggleOwned={handleToggleOwned}
              onToggleDuplicate={handleToggleDuplicate}
              onEdit={() => setActiveTab("edit")}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="edit">
            <StickerEditForm 
              sticker={sticker} 
              onSave={() => {
                onUpdate();
                setActiveTab("details");
              }} 
              onCancel={() => setActiveTab("details")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StickerDetailsDialog;
