
import { generateId } from '../utils';
import { stickers as stickersData } from '../initial-data';
import { Sticker } from '../types';
import { saveToStorage, getFromStorage } from '../sync/storage-utils';

// Get all stickers data
export const getStickerData = (): Sticker[] => {
  return getFromStorage('stickers', stickersData);
};

// Save stickers data with improved event dispatch
export const setStickerData = (data: Sticker[], options?: { albumId?: string, action?: string }): void => {
  console.log(`Saving ${data.length} stickers to storage${options?.albumId ? ` for album ${options.albumId}` : ''}`);
  saveToStorage('stickers', data);
  
  // Dispatch additional events to ensure UI components update
  if (typeof window !== 'undefined') {
    // Use setTimeout to ensure this runs after the current call stack is complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { 
          action: options?.action || 'save', 
          count: data.length,
          albumId: options?.albumId 
        } 
      }));
      
      // Force refresh event to ensure immediate UI updates
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      
      // Additional specialized events for faster targeted updates
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
    }, 10);
  }
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
