
import { StorageEvents } from './constants';

// Filter out soft-deleted items for display
export const filterDeleted = <T>(items: T[]): T[] => {
  return items.filter(item => {
    // Only keep items where isDeleted is not true
    const typedItem = item as any;
    return !typedItem.isDeleted;
  });
};

// Save data directly to Supabase without using localStorage
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    console.log(`Saving ${Array.isArray(data) ? data.length : 1} item(s) to ${key} in cloud`);
    
    // Store data in memory storage first
    setMemoryStorage(key, data);
    
    // Sync to Supabase always
    if (syncToCloud && isConnected) {
      console.log(`Syncing ${key} to Supabase`);
      sendToSupabase(key, data);
      
      // Trigger a sync-start event to show indicator
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
      }
    }
    
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      const eventName = key === 'albums' 
        ? StorageEvents.ALBUMS 
        : key === 'stickers'
          ? StorageEvents.STICKERS
          : key === 'users'
            ? StorageEvents.USERS
            : StorageEvents.EXCHANGE_OFFERS;
      
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      
      // Also dispatch the specific itemChanged event
      if (key === 'stickers') {
        window.dispatchEvent(new CustomEvent('stickerDataChanged'));
        
        // Also dispatch forceRefresh for components that might not listen to stickerDataChanged
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        
        // Add a small delay for components that might load later
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, 200);
      } else if (key === 'albums') {
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
        
        // Also dispatch forceRefresh for components that might not listen to albumDataChanged
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      }
    }
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// In-memory storage for data when localStorage is not used
const memoryStorage: Record<string, any> = {};

// Get data from in-memory storage instead of localStorage
export const getFromStorage = <T>(key: string, defaultValue: T, includeDeleted = false): T => {
  try {
    // Return from memory storage if exists
    if (memoryStorage[key]) {
      const data = memoryStorage[key] as T;
      
      // If we're getting albums or other data that might have soft-deleted items,
      // filter them out for UI purposes unless explicitly requested with includeDeleted
      if (!includeDeleted && Array.isArray(data) && key !== 'recycleBin') {
        // Cast to any to check if items have isDeleted property
        const dataArray = data as any[];
        return filterDeleted(dataArray) as unknown as T;
      }
      
      return data;
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

// Set data to in-memory storage
export const setMemoryStorage = <T>(key: string, data: T): void => {
  memoryStorage[key] = data;
};

// Track connection state
let isConnected = false;

// Export isConnected getter for other modules
export const getIsConnected = () => isConnected;

// Export isConnected setter for sync-manager
export const setIsConnected = (value: boolean) => {
  isConnected = value;
};

// Clear all localStorage data and memory storage
export const clearAllStorageData = (): void => {
  try {
    // Clear all localStorage data
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
      console.log('Cleared all localStorage data');
    }
    
    // Clear in-memory storage as well
    for (const key in memoryStorage) {
      delete memoryStorage[key];
    }
    
    console.log('Cleared all in-memory storage data');
    
    // Trigger a sync event to reload data from Supabase
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    }
  } catch (error) {
    console.error('Error clearing storage data:', error);
  }
};

// Import this for the sendToSupabase function
import { 
  saveAlbumBatch,
  saveStickerBatch,
  saveUserBatch,
  saveExchangeOfferBatch
} from '../supabase';
import { Album, Sticker, User, ExchangeOffer } from '../types';

// Sync data to Supabase
export const sendToSupabase = async <T>(key: string, data: T): Promise<void> => {
  if (Array.isArray(data)) {
    console.log(`Sending ${data.length} items to Supabase for key: ${key}`);
    
    // Save the data to Supabase based on the key
    try {
      switch (key) {
        case 'albums':
          await saveAlbumBatch(data as Album[]);
          
          // Dispatch album-specific events after successful save
          window.dispatchEvent(new CustomEvent('albumDataChanged'));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
          break;
          
        case 'stickers':
          await saveStickerBatch(data as Sticker[]);
          
          // Dispatch sticker-specific events after successful save
          window.dispatchEvent(new CustomEvent('stickerDataChanged'));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
          break;
          
        case 'users':
          await saveUserBatch(data as User[]);
          break;
          
        case 'exchangeOffers':
          await saveExchangeOfferBatch(data as ExchangeOffer[]);
          break;
          
        default:
          console.error(`Unknown key: ${key}`);
          return;
      }
      
      // Dispatch specific events after successful save with a short delay
      setTimeout(() => {
        if (key === 'stickers') {
          window.dispatchEvent(new CustomEvent('stickerDataChanged'));
        } else if (key === 'albums') {
          window.dispatchEvent(new CustomEvent('albumDataChanged'));
        }
        
        // Always trigger a general refresh event
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      }, 200);
      
    } catch (error) {
      console.error(`Error sending data to Supabase (${key}):`, error);
    }
  }
};
