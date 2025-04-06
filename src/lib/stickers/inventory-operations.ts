import { Sticker } from '../types';
import { getStickerData, setStickerData, getStickersByAlbumId } from './basic-operations';
import { updateSticker } from './crud-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Toggle owned status
export const toggleStickerOwned = async (id: string): Promise<Sticker | null> => {
  try {
    const stickers = getStickerData();
    const sticker = stickers.find(s => s.id === id);
    
    if (!sticker) {
      console.error(`Sticker with ID ${id} not found`);
      return null;
    }
    
    // שימוש בפונקציית העדכון המעודכנת שתעדכן גם בשרת
    return await updateSticker(id, { isOwned: !sticker.isOwned });
  } catch (error) {
    console.error(`Error toggling sticker owned status: ${error}`);
    throw error;
  }
};

// Toggle duplicate status
export const toggleStickerDuplicate = async (id: string): Promise<Sticker | null> => {
  try {
    const stickers = getStickerData();
    const sticker = stickers.find(s => s.id === id);
    
    if (!sticker) {
      console.error(`Sticker with ID ${id} not found`);
      return null;
    }
    
    if (!sticker.isOwned) {
      console.error(`Cannot set as duplicate - sticker ${id} is not owned`);
      return null;
    }
    
    const duplicateCount = sticker.isDuplicate 
      ? Math.max(0, (sticker.duplicateCount || 1) - 1) 
      : 1;
    
    const isDuplicate = duplicateCount > 0;
    
    // שימוש בפונקציית העדכון המעודכנת שתעדכן גם בשרת
    return await updateSticker(id, { 
      isDuplicate, 
      duplicateCount: isDuplicate ? duplicateCount : 0 
    });
  } catch (error) {
    console.error(`Error toggling sticker duplicate status: ${error}`);
    throw error;
  }
};

// Add stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: (number | string)[]): { newlyOwned: (number | string)[], duplicatesUpdated: (number | string)[], notFound: (number | string)[] } => {
  const stickers = getStickerData();
  const albumStickers = stickers.filter(s => s.albumId === albumId);
  
  const newlyOwned: (number | string)[] = [];
  const duplicatesUpdated: (number | string)[] = [];
  const notFound: (number | string)[] = [];
  const stickersToUpdate: Sticker[] = [];
  
  stickerNumbers.forEach(number => {
    const sticker = albumStickers.find(s => s.number === number);
    
    if (!sticker) {
      notFound.push(number);
      return;
    }
    
    if (!sticker.isOwned) {
      // Mark as owned for the first time
      const updatedSticker = { ...sticker, isOwned: true };
      stickersToUpdate.push(updatedSticker);
      newlyOwned.push(number);
    } else {
      // Already owned, mark as duplicate
      const updatedSticker = {
        ...sticker,
        isDuplicate: true,
        duplicateCount: (sticker.duplicateCount || 0) + 1
      };
      stickersToUpdate.push(updatedSticker);
      duplicatesUpdated.push(number);
    }
  });
  
  if (stickersToUpdate.length === 0) {
    return { newlyOwned, duplicatesUpdated, notFound };
  }
  
  try {
    // שמירה בשרת - כעת נעשה בצורה שאינה חוסמת
    console.log(`Updating ${stickersToUpdate.length} stickers in inventory on server`);
    saveStickerBatch(stickersToUpdate).catch(error => {
      console.error(`Error updating stickers inventory on server: ${error}`);
    });
    
    // עדכון מקומי בלי להמתין לתשובה מהשרת
    const updatedStickers = stickers.map(sticker => {
      const updatedSticker = stickersToUpdate.find(s => s.id === sticker.id);
      return updatedSticker || sticker;
    });
    
    setStickerData(updatedStickers);
    
    // Trigger events
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    }, 100);
    
    return { newlyOwned, duplicatesUpdated, notFound };
  } catch (error) {
    console.error(`Error updating stickers inventory: ${error}`);
    return { newlyOwned: [], duplicatesUpdated: [], notFound: [] };
  }
};
