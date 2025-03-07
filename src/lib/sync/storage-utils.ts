
import { StorageEvents } from './constants';
import { sendToSupabase } from './supabase-sync';

// Track connection status
let isConnected = navigator.onLine;

// Save data to localStorage and optionally Supabase with improved error handling
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('[Sync] Storage not available - running in a non-browser environment');
      return;
    }
    
    // Check if sync is disabled
    const isSyncDisabled = localStorage.getItem("sync_disabled") === "true";
    
    console.log(`[Sync] Saving ${Array.isArray(data) ? data.length : 1} item(s) to ${key}`);
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Sync to Supabase if required and not disabled
    if (syncToCloud && isOnline() && !isSyncDisabled) {
      console.log(`[Sync] Syncing ${key} to Supabase`);
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
    console.error(`[Sync] Error saving ${key} to storage:`, error);
  }
};

// Get data from localStorage with better error handling
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('[Sync] Storage not available - running in a non-browser environment');
      return defaultValue;
    }
    
    const storedData = localStorage.getItem(key);
    if (!storedData) {
      console.log(`[Sync] No data found in localStorage for ${key}, using default value`);
      return defaultValue;
    }
    
    const parsedData = JSON.parse(storedData) as T;
    console.log(`[Sync] Retrieved ${Array.isArray(parsedData) ? parsedData.length : 1} item(s) from localStorage for ${key}`);
    return parsedData;
  } catch (error) {
    console.error(`[Sync] Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

// Get connection status
export const isOnline = () => {
  return isConnected;
};

// Track connection status changes
export const updateConnectionStatus = (status: boolean) => {
  isConnected = status;
};
