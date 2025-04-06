
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseStickersIntakeProps {
  handleStickerIntake: (albumId: string, stickerNumbers: (number | string)[]) => void;
  handleRefresh: () => void;
}

/**
 * Custom hook to handle sticker intake operations
 */
export const useStickersIntake = ({
  handleStickerIntake,
  handleRefresh
}: UseStickersIntakeProps) => {
  const { toast } = useToast();
  
  const handleStickerIntakeSubmit = async (albumId: string, stickerNumbers: (number | string)[]) => {
    try {
      const results = await handleStickerIntake(albumId, stickerNumbers);
      
      const totalUpdated = results.newlyOwned.length + results.duplicatesUpdated.length;
      
      let message = `נוספו ${totalUpdated} מדבקות למלאי.`;
      if (results.newlyOwned.length > 0) {
        message += ` ${results.newlyOwned.length} מדבקות חדשות.`;
      }
      if (results.duplicatesUpdated.length > 0) {
        message += ` ${results.duplicatesUpdated.length} מדבקות כפולות עודכנו.`;
      }
      if (results.notFound.length > 0) {
        message += ` ${results.notFound.length} מדבקות לא נמצאו.`;
      }
      
      toast({
        title: "מדבקות נוספו למלאי",
        description: message,
      });
      
      handleRefresh();
    } catch (error) {
      console.error("Error adding stickers to inventory:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המדבקות למלאי",
        variant: "destructive"
      });
    }
  };
  
  return {
    handleStickerIntakeSubmit
  };
};
