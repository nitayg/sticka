
import { albums, stickers, users, exchangeOffers } from './initial-data';
import { Album, Sticker, User, ExchangeOffer } from './types';
import { 
  supabase, 
  fetchAlbums, 
  fetchStickers, 
  fetchUsers, 
  fetchExchangeOffers,
  saveBatch 
} from './supabase';

// Event names for storage events
const STORAGE_EVENTS = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated',
  SYNC_COMPLETE: 'sync-complete'
};

// Initialize data from localStorage and Supabase
export const initializeFromStorage = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }

    // Initial load from Supabase
    await syncWithSupabase();
    
    // Listen for Supabase real-time updates
    setupRealtimeSubscriptions();

    // Handle storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      
      switch(event.key) {
        case 'albums':
          if (event.newValue) {
            const newAlbums = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.ALBUMS, { detail: newAlbums }));
          }
          break;
        case 'stickers':
          if (event.newValue) {
            const newStickers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.STICKERS, { detail: newStickers }));
          }
          break;
        case 'users':
          if (event.newValue) {
            const newUsers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.USERS, { detail: newUsers }));
          }
          break;
        case 'exchangeOffers':
          if (event.newValue) {
            const newOffers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.EXCHANGE_OFFERS, { detail: newOffers }));
          }
          break;
      }
    });
  } catch (error) {
    console.error('Error initializing from storage:', error);
  }
};

// Set up real-time subscriptions to Supabase
const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // Enable Supabase realtime for all tables
  supabase.channel('schema-db-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'albums',
    }, (payload) => {
      console.log('Real-time update for albums:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'stickers',
    }, (payload) => {
      console.log('Real-time update for stickers:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
    }, (payload) => {
      console.log('Real-time update for users:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'exchange_offers',
    }, (payload) => {
      console.log('Real-time update for exchange offers:', payload);
      syncWithSupabase();
    })
    .subscribe((status) => {
      console.log('Supabase channel status:', status);
    });
};

// Sync local data with Supabase
export const syncWithSupabase = async () => {
  try {
    console.log('Syncing with Supabase...');
    
    // Let the UI know we're starting a sync
    window.dispatchEvent(new CustomEvent('sync-start'));
    
    // Fetch data from Supabase
    const [albumsData, stickersData, usersData, exchangeOffersData] = await Promise.all([
      fetchAlbums(),
      fetchStickers(),
      fetchUsers(),
      fetchExchangeOffers()
    ]);

    // If we have data from Supabase, update localStorage
    if (albumsData) {
      saveToStorage('albums', albumsData, false);
    }

    if (stickersData) {
      saveToStorage('stickers', stickersData, false);
    }

    if (usersData) {
      saveToStorage('users', usersData, false);
    }

    if (exchangeOffersData) {
      saveToStorage('exchangeOffers', exchangeOffersData, false);
    }

    // Dispatch sync complete event
    window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.SYNC_COMPLETE));
    
    console.log('Sync complete!');
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  }
};

// Save data to localStorage and optionally Supabase
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Sync to Supabase if required
    if (syncToCloud) {
      sendToSupabase(key, data);
      
      // Trigger a sync-start event to show indicator
      window.dispatchEvent(new CustomEvent('sync-start'));
    }
    
    // Dispatch a custom event to notify other components
    const eventName = key === 'albums' 
      ? STORAGE_EVENTS.ALBUMS 
      : key === 'stickers'
        ? STORAGE_EVENTS.STICKERS
        : key === 'users'
          ? STORAGE_EVENTS.USERS
          : STORAGE_EVENTS.EXCHANGE_OFFERS;
    
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Sync data to Supabase
const sendToSupabase = async <T>(key: string, data: T): Promise<void> => {
  if (Array.isArray(data)) {
    // Determine the table name based on the key
    let tableName = '';
    switch (key) {
      case 'albums':
        tableName = 'albums';
        break;
      case 'stickers':
        tableName = 'stickers';
        break;
      case 'users':
        tableName = 'users';
        break;
      case 'exchangeOffers':
        tableName = 'exchange_offers';
        break;
      default:
        console.error(`Unknown key: ${key}`);
        return;
    }
    
    console.log(`Sending ${data.length} items to Supabase table: ${tableName}`);
    
    // Save the data to Supabase
    try {
      await saveBatch(tableName, data);
    } catch (error) {
      console.error(`Error sending data to Supabase (${tableName}):`, error);
    }
  }
};

// Get data from localStorage with error handling
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return defaultValue;
    }
    
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

// Export storage event names for use in components
export const StorageEvents = STORAGE_EVENTS;
