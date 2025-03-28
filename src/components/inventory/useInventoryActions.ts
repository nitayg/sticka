
import { useState } from "react";
import { Sticker } from "@/lib/types";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker } from "@/lib/sticker-operations";
import { useToast } from "../ui/use-toast";

export const useInventoryActions = (onRefresh: () => void) => {
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { toast } = useToast();

  // Reset selected stickers when select mode is disabled
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedStickers([]);
    }
  };

  // Toggle select all stickers
  const toggleSelectAll = (stickers: Sticker[]) => {
    if (selectedStickers.length === stickers.length) {
      setSelectedStickers([]);
    } else {
      setSelectedStickers(stickers.map(sticker => sticker.id));
    }
  };

  // Toggle selection of a single sticker
  const toggleStickerSelection = (stickerId: string) => {
    if (selectedStickers.includes(stickerId)) {
      setSelectedStickers(selectedStickers.filter(id => id !== stickerId));
    } else {
      setSelectedStickers([...selectedStickers, stickerId]);
    }
  };

  // Handle inventory update for a single sticker
  const handleInventoryUpdate = async (sticker: Sticker, increment: boolean) => {
    try {
      if (!sticker.isOwned && increment) {
        // If not owned and incrementing, toggle to owned
        await toggleStickerOwned(sticker.id);
      } else if (sticker.isOwned) {
        if (increment) {
          // If owned and incrementing, increase duplicate count
          const newCount = (sticker.duplicateCount || 0) + 1;
          await updateSticker(sticker.id, { 
            isDuplicate: true, 
            duplicateCount: newCount 
          });
        } else {
          // If owned and decrementing
          const currentCount = sticker.duplicateCount || 0;
          if (currentCount > 0) {
            // If has duplicates, decrease duplicate count
            await updateSticker(sticker.id, { 
              isDuplicate: currentCount - 1 > 0, 
              duplicateCount: currentCount - 1 
            });
          } else {
            // If no duplicates, toggle to not owned
            await toggleStickerOwned(sticker.id);
          }
        }
      }

      // Refresh inventory after update
      onRefresh();

      // Trigger events for syncing
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { action: 'update' } 
      }));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      // Show toast notification
      toast({
        title: increment ? "מדבקה נוספה למלאי" : "מדבקה הוסרה מהמלאי",
        description: `מדבקה מספר ${sticker.number} ${increment ? "נוספה" : "הוסרה"} ${sticker.name ? `(${sticker.name})` : ""}`,
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "שגיאה בעדכון המלאי",
        description: "אירעה שגיאה בעת עדכון המלאי",
        variant: "destructive"
      });
    }
  };

  // Handle bulk updating multiple stickers
  const handleBulkInventoryUpdate = async (stickers: Sticker[], increment: boolean) => {
    if (selectedStickers.length === 0) return;
    
    try {
      const updatePromises = selectedStickers.map(stickerId => {
        const sticker = stickers.find(s => s.id === stickerId);
        if (!sticker) return Promise.resolve();
        
        if (!sticker.isOwned && increment) {
          return toggleStickerOwned(sticker.id);
        } else if (sticker.isOwned) {
          if (increment) {
            const newCount = (sticker.duplicateCount || 0) + 1;
            return updateSticker(sticker.id, { 
              isDuplicate: true, 
              duplicateCount: newCount 
            });
          } else {
            const currentCount = sticker.duplicateCount || 0;
            if (currentCount > 0) {
              return updateSticker(sticker.id, { 
                isDuplicate: currentCount - 1 > 0, 
                duplicateCount: currentCount - 1 
              });
            } else {
              return toggleStickerOwned(sticker.id);
            }
          }
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      // Refresh inventory and show toast
      onRefresh();
      
      // Trigger sync events
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { action: 'bulkUpdate' } 
      }));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      toast({
        title: increment ? "מדבקות נוספו למלאי" : "מדבקות הוסרו מהמלאי",
        description: `${selectedStickers.length} מדבקות ${increment ? "נוספו" : "הוסרו"} מהמלאי`,
      });
      
      // Exit select mode
      setIsSelectMode(false);
      setSelectedStickers([]);
    } catch (error) {
      console.error("Error updating inventory in bulk:", error);
      toast({
        title: "שגיאה בעדכון המלאי",
        description: "אירעה שגיאה בעת עדכון המלאי בצורה מרובה",
        variant: "destructive"
      });
    }
  };

  return {
    selectedStickers,
    isSelectMode,
    toggleSelectMode,
    toggleSelectAll,
    toggleStickerSelection,
    handleInventoryUpdate,
    handleBulkInventoryUpdate
  };
};
