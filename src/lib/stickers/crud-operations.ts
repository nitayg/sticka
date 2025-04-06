
import { Sticker } from '../types';
import { generateId } from '../utils';
import { getStickerData, setStickerData } from './basic-operations';
import { saveSticker, deleteStickerFromSupabase, saveStickerBatch } from '../supabase/stickers';

// Add a new sticker
export const addSticker = async (sticker: Omit<Sticker, 'id'>): Promise<Sticker> => {
  const newSticker: Sticker = {
    id: generateId(),
    ...sticker,
    isOwned: sticker.isOwned || false,
    isDuplicate: sticker.isDuplicate || false,
    duplicateCount: sticker.duplicateCount || 0,
    lastModified: new Date().getTime(),
  };
  
  try {
    // Optimistic update to local state first
    const stickers = getStickerData();
    const updatedStickers = [...stickers, newSticker];
    setStickerData(updatedStickers);
    
    // Force UI refresh
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Then update the server in background
    console.log(`Saving new sticker #${newSticker.number} to server for album ${newSticker.albumId}`);
    saveSticker(newSticker).catch(error => {
      console.error(`Error saving sticker to server: ${error}`);
      // Could add rollback logic here if needed
    });
    
    // Trigger stickerDataChanged event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId: newSticker.albumId, action: 'add' } 
      }));
    }
    
    return newSticker;
  } catch (error) {
    console.error(`Error adding sticker to server: ${error}`);
    throw error;
  }
};

// Update a sticker with optimistic updates
export const updateSticker = async (id: string, updates: Partial<Sticker>): Promise<Sticker | null> => {
  const stickers = getStickerData();
  const stickerIndex = stickers.findIndex(sticker => sticker.id === id);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${id} not found`);
    return null;
  }
  
  const originalSticker = stickers[stickerIndex];
  const updatedSticker = { ...originalSticker, ...updates };
  
  try {
    // Update local state immediately for optimistic UI
    const updatedStickers = [
      ...stickers.slice(0, stickerIndex),
      updatedSticker,
      ...stickers.slice(stickerIndex + 1)
    ];
    
    setStickerData(updatedStickers);
    
    // Force UI refresh
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Update server in background - non-blocking
    console.log(`Updating sticker ${id} on server`);
    saveSticker(updatedSticker).catch(error => {
      console.error(`Error updating sticker on server: ${error}`);
      
      // Rollback on server error
      const currentStickers = getStickerData();
      const currentIndex = currentStickers.findIndex(s => s.id === id);
      
      if (currentIndex !== -1) {
        const rolledBackStickers = [
          ...currentStickers.slice(0, currentIndex),
          originalSticker,
          ...currentStickers.slice(currentIndex + 1)
        ];
        
        setStickerData(rolledBackStickers);
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      }
    });
    
    // Trigger stickerDataChanged event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId: updatedSticker.albumId, action: 'update' } 
      }));
    }
    
    return updatedSticker;
  } catch (error) {
    console.error(`Error updating sticker on server: ${error}`);
    throw error;
  }
};

// Delete a sticker - עדכון לשימוש במחיקה מהשרת
export const deleteSticker = async (id: string): Promise<boolean> => {
  try {
    const stickers = getStickerData();
    const stickerToDelete = stickers.find(sticker => sticker.id === id);
    
    if (!stickerToDelete) {
      console.error(`Sticker with ID ${id} not found`);
      return false;
    }
    
    const albumId = stickerToDelete.albumId;
    
    // מחיקה מהשרת תחילה
    console.log(`Deleting sticker ${id} from server...`);
    const success = await deleteStickerFromSupabase(id);
    
    if (!success) {
      console.error(`Failed to delete sticker ${id} from server`);
      return false;
    }
    
    // לאחר מחיקה מוצלחת מהשרת, עדכון במצב המקומי
    console.log(`Sticker ${id} deleted from server, updating local state`);
    const updatedStickers = stickers.filter(sticker => sticker.id !== id);
    setStickerData(updatedStickers);
    
    // Trigger stickerDataChanged event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { albumId, action: 'delete' } 
      }));
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting sticker ${id}:`, error);
    return false;
  }
};

// Delete stickers by album ID (needed by album-operations.ts)
export const deleteStickersByAlbumId = async (albumId: string): Promise<boolean> => {
  try {
    const allStickers = getStickerData();
    const stickersToDelete = allStickers.filter(sticker => sticker.albumId === albumId);
    
    // אם אין מדבקות למחיקה, נחזיר הצלחה
    if (stickersToDelete.length === 0) {
      return true;
    }
    
    console.log(`Deleting ${stickersToDelete.length} stickers for album ${albumId} from Supabase...`);
    
    // מחיקת כל המדבקות בשרת
    for (const sticker of stickersToDelete) {
      const success = await deleteStickerFromSupabase(sticker.id);
      if (!success) {
        console.error(`Failed to delete sticker ${sticker.id} from server`);
        return false;
      }
    }
    
    // עדכון המצב המקומי לאחר מחיקה מוצלחת מהשרת
    const nonAlbumStickers = allStickers.filter(sticker => sticker.albumId !== albumId);
    setStickerData(nonAlbumStickers);
    
    console.log(`Deleted all stickers for album ${albumId}`);
    
    // Trigger event
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId, action: 'deleteAll' } 
    }));
    
    return true;
  } catch (error) {
    console.error(`Error deleting stickers for album ${albumId}:`, error);
    return false;
  }
};
