import { StorageEvents } from './constants';
import { saveToMemory, getFromMemory } from './memory-storage';

// Filter out soft-deleted items for display
export const filterDeleted = <T>(items: T[]): T[] => {
  return items.filter(item => {
    // Only keep items where isDeleted is not true
    const typedItem = item as any;
    return !typedItem.isDeleted;
  });
};

// Save data to memory instead of localStorage
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    // Save only to localStorage for small data (< 100KB) for cross-tab sync
    // This helps prevent quota issues while still allowing basic cross-tab functionality
    const serialized = JSON.stringify(data);
    if (serialized.length < 100000) {
      try {
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.warn(`Could not save to localStorage (likely quota exceeded): ${error}`);
      }
    }
    
    // Always save to in-memory storage
    saveToMemory(key, data);
    
    // Update in-memory state
    setMemoryStorage(key, data);
    
    // Dispatch event for cross-tab synchronization
    if (typeof window !== 'undefined') {
      // Custom event for better reactivity
      window.dispatchEvent(new CustomEvent(`${key}Updated`, { 
        detail: {
          data,
          timestamp: Date.now()
        }
      }));
      
      // Force refresh for all components that need it
      if (key === 'stickers') {
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      }
    }
  } catch (error) {
    console.error(`Error saving to storage: ${error}`);
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
    
    // Add a staggered sequence of refresh events to ensure all components get updated
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('stickerDataChanged'));
      window.dispatchEvent(new CustomEvent('forceRefresh'));
    }, 100);
  } 
  else if (key === 'albums') {
    console.log('Dispatching albumDataChanged event after saving albums');
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
      window.dispatchEvent(new CustomEvent('forceRefresh'));
    }, 200);
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
    
    // Try to get from in-memory first (which is our primary storage now)
    const memoryData = getFromMemory<T>(key, defaultValue);
    if (memoryData !== defaultValue) {
      return memoryData;
    }

    // If not in memory, try localStorage as fallback for small data
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue) as T;
        // Also save to memory for future access
        setMemoryStorage(key, parsedValue);
        return parsedValue;
      }
    } catch (error) {
      console.warn(`Error reading from localStorage: ${error}`);
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
  saveToMemory(key, data);
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
    
    // Also clear our dedicated memory storage
    clearAllMemory();
    
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
import { clearAllMemory } from './memory-storage';

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
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE));
      
    } catch (error) {
      console.error(`Error sending data to Supabase (${key}):`, error);
      window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_ERROR, { 
        detail: { error } 
      }));
    }
  }
};
