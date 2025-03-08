
import { StorageEvents } from './constants';

// Filter out soft-deleted items for display
export const filterDeleted = <T>(items: T[]): T[] => {
  return items.filter(item => {
    // Only keep items where isDeleted is not true
    const typedItem = item as any;
    return !typedItem.isDeleted;
  });
};

// Save data to localStorage and optionally Supabase
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }
    
    console.log(`Saving ${Array.isArray(data) ? data.length : 1} item(s) to ${key}`);
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Sync to Supabase if required
    if (syncToCloud && isConnected) {
      console.log(`Syncing ${key} to Supabase`);
      sendToSupabase(key, data);
      
      // Trigger a sync-start event to show indicator
      window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    }
    
    // Dispatch a custom event to notify other components
    const eventName = key === 'albums' 
      ? StorageEvents.ALBUMS 
      : key === 'stickers'
        ? StorageEvents.STICKERS
        : key === 'users'
          ? StorageEvents.USERS
          : StorageEvents.EXCHANGE_OFFERS;
    
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Get data from localStorage with error handling
export const getFromStorage = <T>(key: string, defaultValue: T, includeDeleted = false): T => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return defaultValue;
    }
    
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    
    const parsedData = JSON.parse(storedData) as T;
    
    // If we're getting albums or other data that might have soft-deleted items,
    // filter them out for UI purposes unless explicitly requested with includeDeleted
    if (!includeDeleted && Array.isArray(parsedData) && key !== 'recycleBin') {
      // Cast to any to check if items have isDeleted property
      const dataArray = parsedData as any[];
      return filterDeleted(dataArray) as unknown as T;
    }
    
    return parsedData;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

// Track connection state
let isConnected = false;

// Export isConnected getter for other modules
export const getIsConnected = () => isConnected;

// Export isConnected setter for sync-manager
export const setIsConnected = (value: boolean) => {
  isConnected = value;
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
          break;
        case 'stickers':
          await saveStickerBatch(data as Sticker[]);
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
    } catch (error) {
      console.error(`Error sending data to Supabase (${key}):`, error);
    }
  }
};
