import { StorageEvents } from './constants';

// Filter out soft-deleted items for display
export const filterDeleted = <T>(items: T[]): T[] => {
  return items.filter(item => {
    // Only keep items where isDeleted is not true
    const typedItem = item as any;
    return !typedItem.isDeleted;
  });
};

// Keep track of pending saves to batch them
let pendingSaves: Record<string, any[]> = {
  'albums': [],
  'stickers': [],
  'users': [],
  'exchangeOffers': []
};

let saveTimers: Record<string, NodeJS.Timeout | null> = {
  'albums': null,
  'stickers': null,
  'users': null,
  'exchangeOffers': null
};

// Save data directly to Supabase without using localStorage
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    console.log(`Saving ${Array.isArray(data) ? data.length : 1} item(s) to ${key} in cloud`);
    
    // Store data in memory storage first
    setMemoryStorage(key, data);
    
    // Sync to Supabase using batching
    if (syncToCloud && isConnected) {
      // Add to pending saves for batching
      if (Array.isArray(data)) {
        pendingSaves[key] = [...pendingSaves[key], ...data];
      } else {
        pendingSaves[key] = [...pendingSaves[key], data];
      }
      
      // Set up batch timer if not already set
      if (!saveTimers[key]) {
        saveTimers[key] = setTimeout(() => {
          processPendingSaves(key);
        }, 2000); // Wait 2 seconds to collect more saves
      }
      
      // Trigger a sync-start event to show indicator
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
      }
    }
    
    // Dispatch data change events
    dispatchDataChangeEvents(key, data);
    
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Process any pending saves for a specific entity type
const processPendingSaves = async (key: string) => {
  if (!pendingSaves[key].length) return;
  
  const dataToSave = [...pendingSaves[key]];
  pendingSaves[key] = [];
  saveTimers[key] = null;
  
  console.log(`Processing batch of ${dataToSave.length} ${key} to save`);
  
  try {
    // Send to Supabase in batches
    await sendToSupabase(key, dataToSave);
  } catch (error) {
    console.error(`Error sending ${key} batch to Supabase:`, error);
  }
};

// Dispatch appropriate events based on the data type that changed
const dispatchDataChangeEvents = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  // Determine which event to dispatch based on the key
  const eventName = key === 'albums' 
    ? StorageEvents.ALBUMS 
    : key === 'stickers'
      ? StorageEvents.STICKERS
      : key === 'users'
        ? StorageEvents.USERS
        : StorageEvents.EXCHANGE_OFFERS;
  
  // Dispatch the primary event with the data
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  
  // Dispatch additional specific events based on data type
  if (key === 'stickers') {
    console.log('Dispatching stickerDataChanged event after saving stickers');
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { action: 'save', count: Array.isArray(data) ? data.length : 1 } 
    }));
    
    // Also dispatch forceRefresh for components that might not listen to stickerDataChanged
    window.dispatchEvent(new CustomEvent('forceRefresh'));
  } 
  else if (key === 'albums') {
    console.log('Dispatching albumDataChanged event after saving albums');
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
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
      
      // If we're getting arrays that might have soft-deleted items,
      // filter them out for UI purposes unless explicitly requested
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
  // If connection state changed from offline to online, process any pending saves
  if (!isConnected && value) {
    Object.keys(pendingSaves).forEach(key => {
      if (pendingSaves[key].length > 0) {
        processPendingSaves(key);
      }
    });
  }
  
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
    
    // Clear pending saves
    for (const key in pendingSaves) {
      pendingSaves[key] = [];
    }
    
    // Clear save timers
    for (const key in saveTimers) {
      if (saveTimers[key]) {
        clearTimeout(saveTimers[key]!);
        saveTimers[key] = null;
      }
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
export const sendToSupabase = async <T>(key: string, data: T[]): Promise<void> => {
  if (!Array.isArray(data) || data.length === 0) {
    console.log(`No data to send to Supabase for key: ${key}`);
    return;
  }
  
  console.log(`Sending ${data.length} items to Supabase for key: ${key}`);
  
  // Batch data in chunks of 50 to prevent large payloads
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    try {
      let success = false;
      
      switch (key) {
        case 'albums':
          success = await saveAlbumBatch(batch as Album[]);
          break;
          
        case 'stickers':
          success = await saveStickerBatch(batch as Sticker[]);
          break;
          
        case 'users':
          success = await saveUserBatch(batch as User[]);
          break;
          
        case 'exchangeOffers':
          success = await saveExchangeOfferBatch(batch as ExchangeOffer[]);
          break;
          
        default:
          console.error(`Unknown key: ${key}`);
          return;
      }
      
      if (!success) {
        console.error(`Failed to save batch ${i / BATCH_SIZE + 1} for ${key}`);
      }
      
    } catch (error) {
      console.error(`Error sending batch ${i / BATCH_SIZE + 1} of ${key} to Supabase:`, error);
    }
  }
  
  // Dispatch success event
  window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE));
};
