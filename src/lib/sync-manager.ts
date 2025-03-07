
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
export const StorageEvents = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated',
  SYNC_COMPLETE: 'sync-complete',
  SYNC_START: 'sync-start'
};

// Track connection and sync state
let isConnected = false;
let lastSyncTime = null;
let syncInProgress = false;

// Initialize data from localStorage and Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('Initializing data from storage and Supabase...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }

    // Initial load from Supabase
    await syncWithSupabase(true);
    
    // Listen for online status changes
    window.addEventListener('online', () => {
      console.log('Device is online, triggering sync');
      isConnected = true;
      syncWithSupabase();
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline');
      isConnected = false;
    });

    // Initial online check
    isConnected = navigator.onLine;
    console.log(`Initial connection status: ${isConnected ? 'online' : 'offline'}`);
    
    // Listen for Supabase real-time updates
    setupRealtimeSubscriptions();

    // Handle storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      
      switch(event.key) {
        case 'albums':
          if (event.newValue) {
            const newAlbums = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: newAlbums }));
          }
          break;
        case 'stickers':
          if (event.newValue) {
            const newStickers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: newStickers }));
          }
          break;
        case 'users':
          if (event.newValue) {
            const newUsers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: newUsers }));
          }
          break;
        case 'exchangeOffers':
          if (event.newValue) {
            const newOffers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: newOffers }));
          }
          break;
      }
    });
    
    console.log('Storage initialization complete');
  } catch (error) {
    console.error('Error initializing from storage:', error);
  }
};

// Set up real-time subscriptions to Supabase
const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // Create a channel for all tables
  const channel = supabase.channel('public:all-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'albums' 
    }, (payload) => {
      console.log('Real-time update for albums:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'stickers' 
    }, (payload) => {
      console.log('Real-time update for stickers:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users' 
    }, (payload) => {
      console.log('Real-time update for users:', payload);
      syncWithSupabase();
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'exchange_offers' 
    }, (payload) => {
      console.log('Real-time update for exchange offers:', payload);
      syncWithSupabase();
    });
  
  // Make sure we pass all three arguments to subscribe
  channel.subscribe((status, err) => {
    console.log('Supabase channel status:', status, err);
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to real-time updates');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to real-time updates', err);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        channel.subscribe((status, err) => {
          console.log('Reconnection status:', status, err);
        });
      }, 5000);
    }
  });
};

// Sync local data with Supabase
export const syncWithSupabase = async (isInitialSync = false) => {
  if (syncInProgress) {
    console.log('Sync already in progress, skipping this request');
    return;
  }

  try {
    console.log('Syncing with Supabase...');
    syncInProgress = true;
    
    // Let the UI know we're starting a sync
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    // Fetch data from Supabase
    const [albumsData, stickersData, usersData, exchangeOffersData] = await Promise.all([
      fetchAlbums(),
      fetchStickers(),
      fetchUsers(),
      fetchExchangeOffers()
    ]);

    // If we have data from Supabase, update localStorage
    if (albumsData && albumsData.length > 0) {
      saveToStorage('albums', albumsData, false);
    } else if (isInitialSync) {
      // On initial sync, if no remote data and we have local data, upload it
      const localAlbums = getFromStorage('albums', []);
      if (localAlbums && localAlbums.length > 0) {
        console.log('Uploading local albums to Supabase');
        await saveBatch('albums', localAlbums);
      }
    }

    if (stickersData && stickersData.length > 0) {
      saveToStorage('stickers', stickersData, false);
    } else if (isInitialSync) {
      const localStickers = getFromStorage('stickers', []);
      if (localStickers && localStickers.length > 0) {
        console.log('Uploading local stickers to Supabase');
        await saveBatch('stickers', localStickers);
      }
    }

    if (usersData && usersData.length > 0) {
      saveToStorage('users', usersData, false);
    } else if (isInitialSync) {
      const localUsers = getFromStorage('users', []);
      if (localUsers && localUsers.length > 0) {
        console.log('Uploading local users to Supabase');
        await saveBatch('users', localUsers);
      }
    }

    if (exchangeOffersData && exchangeOffersData.length > 0) {
      saveToStorage('exchangeOffers', exchangeOffersData, false);
    } else if (isInitialSync) {
      const localExchangeOffers = getFromStorage('exchangeOffers', []);
      if (localExchangeOffers && localExchangeOffers.length > 0) {
        console.log('Uploading local exchange offers to Supabase');
        await saveBatch('exchange_offers', localExchangeOffers);
      }
    }

    // Update sync tracking
    lastSyncTime = new Date();
    
    // Dispatch sync complete event
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: lastSyncTime }
    }));
    
    console.log('Sync complete at', lastSyncTime);
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  } finally {
    syncInProgress = false;
  }
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
    
    // Save the data to Supabase and trigger a sync to ensure other clients get the updates
    try {
      await saveBatch(tableName, data);
      syncWithSupabase(); // Sync after changes to ensure other clients are updated
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

// Get last sync time
export const getLastSyncTime = () => {
  return lastSyncTime;
};

// Check if sync is in progress
export const isSyncInProgress = () => {
  return syncInProgress;
};

// Force a manual sync - only if changes have been made
export const forceSync = () => {
  if (!syncInProgress && navigator.onLine) {
    return syncWithSupabase();
  }
  return Promise.resolve(false);
};
