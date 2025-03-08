
import { toggleDatabaseItem } from './utils';
import { generateId } from './utils';
import { Sticker, StickerData } from './types';
import { getFromStorage, saveToStorage } from './sync/storage-utils';
import { parseCSV } from '@/utils/csv-parser';

// Export other functions from the module
export * from './sticker-utils';

// Get all stickers for a specific album
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  const allStickers = getFromStorage<Sticker[]>('stickers', []);
  return allStickers.filter(sticker => sticker.albumId === albumId);
};

// Add a new sticker
export const addSticker = (sticker: Omit<Sticker, 'id' | 'createdAt'>): Sticker => {
  const newSticker: Sticker = {
    id: generateId(),
    ...sticker,
    createdAt: new Date().toISOString(),
  };
  
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = [...stickers, newSticker];
  
  saveToStorage('stickers', updatedStickers);
  
  // Dispatch sticker added event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: sticker.albumId }
    }));
  }
  
  return newSticker;
};

// Update an existing sticker
export const updateSticker = (stickerId: string, updates: Partial<Sticker>): Sticker | null => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const stickerIndex = stickers.findIndex(s => s.id === stickerId);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${stickerId} not found`);
    return null;
  }
  
  const updatedSticker = { ...stickers[stickerIndex], ...updates };
  const updatedStickers = [...stickers];
  updatedStickers[stickerIndex] = updatedSticker;
  
  saveToStorage('stickers', updatedStickers);
  
  // Dispatch sticker updated event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: updatedSticker.albumId }
    }));
  }
  
  return updatedSticker;
};

// Delete a sticker
export const deleteSticker = (stickerId: string): boolean => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const stickerIndex = stickers.findIndex(s => s.id === stickerId);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${stickerId} not found`);
    return false;
  }
  
  const albumId = stickers[stickerIndex].albumId;
  const updatedStickers = stickers.filter(s => s.id !== stickerId);
  
  saveToStorage('stickers', updatedStickers);
  
  // Dispatch sticker deleted event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId }
    }));
  }
  
  return true;
};

// Toggle a sticker's "owned" status
export const toggleStickerOwned = (stickerId: string): Sticker | null => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const stickerIndex = stickers.findIndex(s => s.id === stickerId);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${stickerId} not found`);
    return null;
  }
  
  const updatedSticker = { 
    ...stickers[stickerIndex], 
    isOwned: !stickers[stickerIndex].isOwned 
  };
  
  // If we're marking it as not owned, also mark it as not a duplicate
  if (!updatedSticker.isOwned) {
    updatedSticker.isDuplicate = false;
  }
  
  const updatedStickers = [...stickers];
  updatedStickers[stickerIndex] = updatedSticker;
  
  saveToStorage('stickers', updatedStickers);
  
  // Dispatch sticker toggled event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: updatedSticker.albumId }
    }));
  }
  
  return updatedSticker;
};

// Toggle a sticker's "duplicate" status
export const toggleStickerDuplicate = (stickerId: string): Sticker | null => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const stickerIndex = stickers.findIndex(s => s.id === stickerId);
  
  if (stickerIndex === -1) {
    console.error(`Sticker with ID ${stickerId} not found`);
    return null;
  }
  
  // Can only mark as duplicate if it's owned
  if (!stickers[stickerIndex].isOwned) {
    console.error(`Cannot mark sticker as duplicate because it's not owned`);
    return null;
  }
  
  const updatedSticker = { 
    ...stickers[stickerIndex], 
    isDuplicate: !stickers[stickerIndex].isDuplicate 
  };
  
  const updatedStickers = [...stickers];
  updatedStickers[stickerIndex] = updatedSticker;
  
  saveToStorage('stickers', updatedStickers);
  
  // Dispatch sticker toggled event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { albumId: updatedSticker.albumId }
    }));
  }
  
  return updatedSticker;
};

// Import stickers from CSV data
export const importStickersFromCSV = (albumId: string, data: [number, string, string][]): Sticker[] => {
  console.log(`Importing ${data.length} stickers for album ${albumId}`);
  
  if (!albumId || !data || data.length === 0) {
    console.error("Invalid album ID or empty data for CSV import");
    return [];
  }
  
  const existingStickers = getFromStorage<Sticker[]>('stickers', []);
  const albumStickers = existingStickers.filter(s => s.albumId === albumId);
  const newStickers: Sticker[] = [];
  
  // Process each sticker from CSV
  for (const [number, name, team] of data) {
    // Check if this sticker number already exists for this album
    const existingSticker = albumStickers.find(s => s.number === number);
    
    if (existingSticker) {
      console.log(`Sticker #${number} already exists for album ${albumId}, skipping`);
      continue;
    }
    
    // Create a new sticker
    const newSticker: Sticker = {
      id: generateId(),
      albumId,
      number,
      name: name || `מדבקה #${number}`,
      team: team || '',
      isOwned: false,
      isDuplicate: false,
      image: '',
      createdAt: new Date().toISOString(),
    };
    
    newStickers.push(newSticker);
  }
  
  if (newStickers.length === 0) {
    console.log("No new stickers to import");
    return [];
  }
  
  // Add new stickers to storage
  const updatedStickers = [...existingStickers, ...newStickers];
  saveToStorage('stickers', updatedStickers, true); // Force sync to cloud
  
  console.log(`Successfully imported ${newStickers.length} new stickers for album ${albumId}`);
  
  // Dispatch events to update UI - use multiple events for different listeners
  if (typeof window !== 'undefined') {
    // Create a custom event with album ID in detail
    const customEvent = new CustomEvent('stickerDataChanged', {
      detail: { albumId, count: newStickers.length }
    });
    window.dispatchEvent(customEvent);
    
    // Also dispatch a generic force refresh event
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Delayed refresh event for components that might not be ready yet
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('stickerDataChanged', {
        detail: { albumId, count: newStickers.length }
      }));
    }, 300);
  }
  
  return newStickers;
};

// Get statistics for an album
export const getStats = (albumId: string) => {
  const stickers = getStickersByAlbumId(albumId);
  
  const totalStickers = stickers.length;
  const ownedStickers = stickers.filter(s => s.isOwned).length;
  const duplicateStickers = stickers.filter(s => s.isDuplicate).length;
  const neededStickers = totalStickers - ownedStickers;
  
  const completionPercentage = totalStickers > 0 
    ? Math.round((ownedStickers / totalStickers) * 100) 
    : 0;
  
  return {
    totalStickers,
    ownedStickers,
    duplicateStickers,
    neededStickers,
    completionPercentage
  };
};

// Add stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: number[]): {
  newlyOwned: number[],
  duplicatesUpdated: number[],
  notFound: number[]
} => {
  const allStickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = [...allStickers];
  
  const results = {
    newlyOwned: [] as number[],
    duplicatesUpdated: [] as number[],
    notFound: [] as number[]
  };
  
  // Process each sticker number
  for (const number of stickerNumbers) {
    // Find the sticker in the album
    const stickerIndex = updatedStickers.findIndex(
      s => s.albumId === albumId && s.number === number
    );
    
    if (stickerIndex === -1) {
      // Sticker not found
      results.notFound.push(number);
      continue;
    }
    
    // Get the sticker
    const sticker = updatedStickers[stickerIndex];
    
    if (sticker.isOwned) {
      // Sticker is already owned, mark as duplicate
      if (!sticker.isDuplicate) {
        updatedStickers[stickerIndex] = {
          ...sticker,
          isDuplicate: true
        };
        results.duplicatesUpdated.push(number);
      }
    } else {
      // Sticker is not owned, mark as owned
      updatedStickers[stickerIndex] = {
        ...sticker,
        isOwned: true
      };
      results.newlyOwned.push(number);
    }
  }
  
  // Only save if changes were made
  if (results.newlyOwned.length > 0 || results.duplicatesUpdated.length > 0) {
    saveToStorage('stickers', updatedStickers);
    
    // Dispatch events to update UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', {
        detail: { albumId }
      }));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    }
  }
  
  return results;
};

// Generic function to get sticker data
export const getStickerData = (): Sticker[] => {
  return getFromStorage<Sticker[]>('stickers', []);
};

// Generic function to set sticker data
export const setStickerData = (stickers: Sticker[]): void => {
  saveToStorage('stickers', stickers);
  
  // Dispatch events to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stickerDataChanged'));
  }
};
