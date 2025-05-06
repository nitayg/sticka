
import { generateId } from '../utils';
import { stickers as stickersData } from '../initial-data';
import { Sticker } from '../types';
import { saveToStorage, getFromStorage } from '../sync/storage-utils';
import { getAlbumStickers } from '../sync/sync-manager';

// מטמון מקומי לאופטימיזציה
const localStickerCache: Record<string, {
  data: Sticker[];
  timestamp: number;
}> = {};

// זמן תפוגה למטמון (2 דקות - קוצר להגברת תגובתיות)
const CACHE_TTL = 2 * 60 * 1000;

// Get all stickers data
export const getStickerData = (): Sticker[] => {
  console.warn('Using getStickerData() loads ALL stickers which can cause high egress');
  console.warn('Consider using getStickersByAlbumId() for specific albums instead');
  return getFromStorage('stickers', stickersData);
};

// Save stickers data with improved event dispatch
export const setStickerData = (data: Sticker[], options?: { albumId?: string, action?: string }): void => {
  console.log(`Saving ${data.length} stickers to storage${options?.albumId ? ` for album ${options.albumId}` : ''}`);
  saveToStorage('stickers', data);
  
  // Clear the local cache for this album if specified
  if (options?.albumId && localStickerCache[options.albumId]) {
    delete localStickerCache[options.albumId];
  }
  
  // Dispatch additional events to ensure UI components update
  if (typeof window !== 'undefined') {
    // Dispatch events immediately for more responsive UI
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
  }
};

// Get stickers by album ID with improved caching and egress reduction
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  if (!albumId) return [];
  
  // Check if we have fresh data in the cache
  const now = Date.now();
  if (localStickerCache[albumId] && 
      now - localStickerCache[albumId].timestamp < CACHE_TTL) {
    console.log(`Using local memory cache for album ${albumId} stickers - age: ${Math.round((now - localStickerCache[albumId].timestamp)/1000)}s`);
    return localStickerCache[albumId].data;
  }
  
  try {
    console.log(`Getting stickers for album ${albumId} from local storage`);
    
    // Use local storage data
    const allStickers = getFromStorage('stickers', stickersData);
    const filteredStickers = allStickers.filter(sticker => sticker.albumId === albumId);
    
    // Update our local cache
    localStickerCache[albumId] = {
      data: filteredStickers,
      timestamp: now
    };
    
    console.log(`Found ${filteredStickers.length} stickers for album ${albumId} (from local storage)`);
    return filteredStickers;
  } catch (error) {
    console.error(`Error in getStickersByAlbumId for album ${albumId}:`, error);
    return [];
  }
};

// Get stickers by album ID asynchronously (for optimized egress reduction)
export const getStickersByAlbumIdAsync = async (albumId: string): Promise<Sticker[]> => {
  if (!albumId) return [];
  
  try {
    console.log(`Getting stickers for album ${albumId} using optimized fetch`);
    
    // Use the optimized function from sync-manager that already has caching built in
    const stickers = await getAlbumStickers(albumId);
    
    // Update our local cache
    localStickerCache[albumId] = {
      data: stickers,
      timestamp: Date.now()
    };
    
    console.log(`Found ${stickers.length} stickers for album ${albumId} (optimized fetch)`);
    return stickers;
  } catch (error) {
    console.error(`Error in getStickersByAlbumIdAsync for album ${albumId}:`, error);
    
    // Fallback to sync version
    return getStickersByAlbumId(albumId);
  }
};

// Expose a non-async version for backward compatibility
export const getStickersByAlbumIdSync = (albumId: string): Sticker[] => {
  return getStickersByAlbumId(albumId);
};

// Clear the memory cache for specific album or all albums
export const clearStickerCache = (albumId?: string) => {
  if (albumId) {
    if (localStickerCache[albumId]) {
      delete localStickerCache[albumId];
      console.log(`Cleared sticker cache for album ${albumId}`);
    }
  } else {
    Object.keys(localStickerCache).forEach(key => {
      delete localStickerCache[key];
    });
    console.log('Cleared all sticker caches');
  }
};
