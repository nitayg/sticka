
import { Sticker } from '../types';
import { getStickerData, setStickerData, getStickersByAlbumId } from './basic-operations';
import { updateSticker } from './crud-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Queue for batching sticker updates
let updateQueue: Sticker[] = [];
let updateTimerId: NodeJS.Timeout | null = null;

// Process the update queue
const processUpdateQueue = async () => {
  if (updateQueue.length === 0) return;
  
  const batchToProcess = [...updateQueue];
  updateQueue = [];
  
  console.log(`Processing batch of ${batchToProcess.length} sticker updates`);
  
  try {
    // Save to Supabase in one batch operation
    await saveStickerBatch(batchToProcess);
    
    // Update local data
    const allStickers = getStickerData();
    const updatedStickers = allStickers.map(sticker => {
      const updatedSticker = batchToProcess.find(s => s.id === sticker.id);
      return updatedSticker || sticker;
    });
    
    setStickerData(updatedStickers);
    
    // Trigger UI refresh
    window.dispatchEvent(new CustomEvent('stickerDataChanged'));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
  } catch (error) {
    console.error('Error processing sticker update batch:', error);
  }
};

// Queue a sticker update and return immediately
const queueStickerUpdate = (sticker: Sticker): void => {
  // Replace any existing update for this sticker
  updateQueue = updateQueue.filter(s => s.id !== sticker.id);
  updateQueue.push(sticker);
  
  // Set a timer to process updates if not already set
  if (!updateTimerId) {
    updateTimerId = setTimeout(() => {
      updateTimerId = null;
      processUpdateQueue();
    }, 500); // Wait 500ms to batch updates
  }
};

// Toggle owned status
export const toggleStickerOwned = async (id: string): Promise<Sticker | null> => {
  try {
    const stickers = getStickerData();
    const sticker = stickers.find(s => s.id === id);
    
    if (!sticker) {
      console.error(`Sticker with ID ${id} not found`);
      return null;
    }
    
    // Update sticker data
    const updatedSticker = { 
      ...sticker, 
      isOwned: !sticker.isOwned,
      lastModified: new Date().getTime()
    };
    
    // Immediately update UI
    const updatedStickers = stickers.map(s => 
      s.id === id ? updatedSticker : s
    );
    setStickerData(updatedStickers);
    
    // Queue the update to be sent to server
    queueStickerUpdate(updatedSticker);
    
    return updatedSticker;
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
    
    // Update sticker data
    const updatedSticker = {
      ...sticker,
      isDuplicate,
      duplicateCount: isDuplicate ? duplicateCount : 0,
      lastModified: new Date().getTime()
    };
    
    // Immediately update UI
    const updatedStickers = stickers.map(s => 
      s.id === id ? updatedSticker : s
    );
    setStickerData(updatedStickers);
    
    // Queue the update to be sent to server
    queueStickerUpdate(updatedSticker);
    
    return updatedSticker;
  } catch (error) {
    console.error(`Error toggling sticker duplicate status: ${error}`);
    throw error;
  }
};

// Add stickers to inventory with batching
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
      const updatedSticker = { 
        ...sticker, 
        isOwned: true,
        lastModified: new Date().getTime()
      };
      stickersToUpdate.push(updatedSticker);
      newlyOwned.push(number);
    } else {
      // Already owned, mark as duplicate
      const updatedSticker = {
        ...sticker,
        isDuplicate: true,
        duplicateCount: (sticker.duplicateCount || 0) + 1,
        lastModified: new Date().getTime()
      };
      stickersToUpdate.push(updatedSticker);
      duplicatesUpdated.push(number);
    }
  });
  
  if (stickersToUpdate.length === 0) {
    return { newlyOwned, duplicatesUpdated, notFound };
  }
  
  try {
    // Immediately update UI
    const updatedAllStickers = stickers.map(sticker => {
      const updatedSticker = stickersToUpdate.find(s => s.id === sticker.id);
      return updatedSticker || sticker;
    });
    
    setStickerData(updatedAllStickers);
    
    // Save to server in background - don't wait for response
    console.log(`Updating ${stickersToUpdate.length} stickers in inventory`);
    
    // Send updates in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < stickersToUpdate.length; i += BATCH_SIZE) {
      const batch = stickersToUpdate.slice(i, i + BATCH_SIZE);
      saveStickerBatch(batch).catch(error => {
        console.error(`Error updating stickers batch ${i / BATCH_SIZE + 1}:`, error);
      });
    }
    
    // Trigger UI refresh
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    }, 100);
    
    return { newlyOwned, duplicatesUpdated, notFound };
  } catch (error) {
    console.error(`Error updating stickers inventory:`, error);
    return { newlyOwned: [], duplicatesUpdated: [], notFound: [] };
  }
};
