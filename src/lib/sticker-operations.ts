import { generateId } from './utils';
import { stickers as stickersData } from './initial-data';
import { Sticker } from './types';
import { saveToStorage, getFromStorage } from './sync/storage-utils';
import { deleteStickerFromSupabase } from './supabase/stickers';

// Get all stickers data
export const getStickerData = (): Sticker[] => {
  return getFromStorage('stickers', stickersData);
};

// Save stickers data
export const setStickerData = (data: Sticker[]): void => {
  console.log(`Saving ${data.length} stickers to storage`);
  saveToStorage('stickers', data);
};

// Get stickers by album ID
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  const allStickers = getStickerData();
  if (!albumId) return [];
  
  console.log(`Getting stickers for album ${albumId}. Total stickers: ${allStickers.length}`);
  
  const filteredStickers = allStickers.filter(sticker => sticker.albumId === albumId);
  console.log(`Found ${filteredStickers.length} stickers for album ${albumId}`);
  
  return filteredStickers;
};

// Add a new sticker
export const addSticker = (sticker: Omit<Sticker, 'id'>): Sticker => {
  const newSticker: Sticker = {
    id: generateId(),
    ...sticker,
    isOwned: sticker.isOwned || false,
    isDuplicate: sticker.isDuplicate || false,
    duplicateCount: sticker.duplicateCount || 0,
    lastModified: new Date().getTime(),
  };
  
  const stickers = getStickerData();
  const updatedStickers = [...stickers, newSticker];
  
  console.log(`Adding new sticker #${newSticker.number} to album ${newSticker.albumId}`);
  setStickerData(updatedStickers);
  
  // Trigger stickerDataChanged event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: newSticker.albumId, action: 'add' } 
    }));
  }
  
  return newSticker;
};

// Update a sticker
export const updateSticker = (id: string, updates: Partial<Sticker>): Sticker | null => {
  const stickers = getStickerData();
  const stickerIndex = stickers.findIndex(sticker => sticker.id === id);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${id} not found`);
    return null;
  }
  
  const updatedSticker = { ...stickers[stickerIndex], ...updates };
  const updatedStickers = [
    ...stickers.slice(0, stickerIndex),
    updatedSticker,
    ...stickers.slice(stickerIndex + 1)
  ];
  
  setStickerData(updatedStickers);
  
  // Trigger stickerDataChanged event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: updatedSticker.albumId, action: 'update' } 
    }));
  }
  
  return updatedSticker;
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

// Toggle owned status
export const toggleStickerOwned = (id: string): Sticker | null => {
  const stickers = getStickerData();
  const sticker = stickers.find(s => s.id === id);
  
  if (!sticker) {
    console.error(`Sticker with ID ${id} not found`);
    return null;
  }
  
  return updateSticker(id, { isOwned: !sticker.isOwned });
};

// Toggle duplicate status
export const toggleStickerDuplicate = (id: string): Sticker | null => {
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
  
  return updateSticker(id, { 
    isDuplicate, 
    duplicateCount: isDuplicate ? duplicateCount : 0 
  });
};

// Import stickers from CSV
export const importStickersFromCSV = (albumId: string, data: [number, string, string][]): Sticker[] => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  console.log(`First few entries:`, data.slice(0, 3));
  
  // Get existing stickers for this album
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  const existingNumbers = new Set(existingStickers.map(s => s.number));
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const allStickers = getStickerData();
  
  data.forEach(([number, name, team]) => {
    // Skip if the sticker already exists with this number in this album
    if (existingNumbers.has(number)) {
      console.log(`Skipping sticker #${number} - already exists in album`);
      return;
    }
    
    const newSticker: Sticker = {
      id: generateId(),
      number,
      name: name || `Sticker ${number}`,
      team: team || 'Unknown',
      teamLogo: '',
      category: team || 'Default',
      imageUrl: '',
      isOwned: false,
      isDuplicate: false,
      duplicateCount: 0,
      albumId,
      lastModified: new Date().getTime(),
    };
    
    newStickers.push(newSticker);
  });
  
  if (newStickers.length === 0) {
    console.warn('No new stickers to import');
    return [];
  }
  
  // Save all stickers at once
  console.log(`Adding ${newStickers.length} new stickers to album ${albumId}`);
  const updatedStickers = [...allStickers, ...newStickers];
  setStickerData(updatedStickers);
  
  // Trigger events with a slight delay to ensure data is saved
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      console.log(`Dispatching sticker data changed events for ${newStickers.length} new stickers`);
      
      // Dispatch the specific event
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { 
          albumId, 
          action: 'import',
          count: newStickers.length 
        } 
      }));
      
      // Dispatch a general refresh event
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      
      // Additional event at a longer delay to catch components that might initialize later
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
          detail: { albumId, count: newStickers.length } 
        }));
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      }, 500);
    }
  }, 100);
  
  return newStickers;
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

// Update team name across all stickers (needed by team management components)
export const updateTeamNameAcrossStickers = (oldTeamName: string, newTeamName: string, newTeamLogo: string): number => {
  const allStickers = getStickerData();
  let updatedCount = 0;
  
  const updatedStickers = allStickers.map(sticker => {
    if (sticker.team === oldTeamName) {
      updatedCount++;
      return {
        ...sticker,
        team: newTeamName,
        teamLogo: newTeamLogo || sticker.teamLogo,
        lastModified: new Date().getTime()
      };
    }
    return sticker;
  });
  
  if (updatedCount > 0) {
    setStickerData(updatedStickers);
    
    // Trigger events
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { action: 'updateTeam', count: updatedCount } 
    }));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
  }
  
  return updatedCount;
};

// Get album statistics
export const getStats = () => {
  const stickers = getStickerData();
  
  const totalStickers = stickers.length;
  const ownedStickers = stickers.filter(s => s.isOwned).length;
  const duplicateStickers = stickers.filter(s => s.isDuplicate).length;
  const neededStickers = totalStickers - ownedStickers;
  const completionPercentage = totalStickers > 0 
    ? Math.round((ownedStickers / totalStickers) * 100) 
    : 0;
  
  // Return in both formats for compatibility
  return {
    // New format
    totalStickers,
    ownedStickers,
    duplicateStickers,
    neededStickers,
    completionPercentage,
    // Old format for backward compatibility
    total: totalStickers,
    owned: ownedStickers,
    needed: neededStickers,
    duplicates: duplicateStickers
  };
};

// Add stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: number[]) => {
  const stickers = getStickerData();
  const albumStickers = stickers.filter(s => s.albumId === albumId);
  
  const newlyOwned: number[] = [];
  const duplicatesUpdated: number[] = [];
  const notFound: number[] = [];
  
  stickerNumbers.forEach(number => {
    const sticker = albumStickers.find(s => s.number === number);
    
    if (!sticker) {
      notFound.push(number);
      return;
    }
    
    if (!sticker.isOwned) {
      // Mark as owned for the first time
      updateSticker(sticker.id, { isOwned: true });
      newlyOwned.push(number);
    } else {
      // Already owned, mark as duplicate
      updateSticker(sticker.id, { 
        isDuplicate: true, 
        duplicateCount: (sticker.duplicateCount || 0) + 1 
      });
      duplicatesUpdated.push(number);
    }
  });
  
  // Trigger events
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
  }, 100);
  
  return { newlyOwned, duplicatesUpdated, notFound };
};
