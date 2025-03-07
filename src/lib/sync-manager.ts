
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

// Event names for storage events with more consistent naming
export const StorageEvents = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated',
  SYNC_COMPLETE: 'sync-complete',
  SYNC_START: 'sync-start'
};

// Track connection and sync state
let isConnected = navigator.onLine;
let lastSyncTime = null;
let syncInProgress = false;
let pendingSync = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Device identifier for debugging
const deviceId = `device_${Math.random().toString(36).substring(2, 9)}`;
console.log(`[Sync] Device ID: ${deviceId}`);

// Initialize data from localStorage and Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('[Sync] Initializing data from storage and Supabase...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('[Sync] Storage not available - running in a non-browser environment');
      return;
    }

    // Initial load from Supabase with retry logic
    await syncWithSupabase(true);
    
    // Setup more frequent sync during initial phase, then slow down
    const initialSyncInterval = setInterval(() => {
      if (!syncInProgress && navigator.onLine) {
        pendingSync = true;
        syncWithSupabase();
      }
    }, 10000); // Every 10 seconds initially
    
    // After 1 minute, switch to less frequent syncing
    setTimeout(() => {
      clearInterval(initialSyncInterval);
      
      // Setup periodic sync every 30 seconds
      setInterval(() => {
        if (!syncInProgress && navigator.onLine) {
          pendingSync = true;
          syncWithSupabase();
        }
      }, 30000); // Every 30 seconds
    }, 60000); // After 1 minute

    // Enhanced online status monitoring
    window.addEventListener('online', () => {
      console.log('[Sync] Device is online, triggering sync');
      isConnected = true;
      reconnectAttempts = 0;
      syncWithSupabase();
      
      // Notify UI that we're back online
      window.dispatchEvent(new CustomEvent('connection-status-changed', { 
        detail: { isOnline: true } 
      }));
    });

    window.addEventListener('offline', () => {
      console.log('[Sync] Device is offline');
      isConnected = false;
      
      // Notify UI that we're offline
      window.dispatchEvent(new CustomEvent('connection-status-changed', { 
        detail: { isOnline: false } 
      }));
    });

    // Initial online check
    isConnected = navigator.onLine;
    console.log(`[Sync] Initial connection status: ${isConnected ? 'online' : 'offline'}`);
    
    // Listen for Supabase real-time updates with enhanced handling
    setupRealtimeSubscriptions();

    // Handle storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      
      switch(event.key) {
        case 'albums':
          if (event.newValue) {
            const newAlbums = JSON.parse(event.newValue);
            console.log('[Sync] Storage event: albums updated in another tab');
            window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: newAlbums }));
          }
          break;
        case 'stickers':
          if (event.newValue) {
            const newStickers = JSON.parse(event.newValue);
            console.log('[Sync] Storage event: stickers updated in another tab');
            window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: newStickers }));
          }
          break;
        case 'users':
          if (event.newValue) {
            const newUsers = JSON.parse(event.newValue);
            console.log('[Sync] Storage event: users updated in another tab');
            window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: newUsers }));
          }
          break;
        case 'exchangeOffers':
          if (event.newValue) {
            const newOffers = JSON.parse(event.newValue);
            console.log('[Sync] Storage event: exchange offers updated in another tab');
            window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: newOffers }));
          }
          break;
      }
    });
    
    console.log('[Sync] Storage initialization complete');
    return true;
  } catch (error) {
    console.error('[Sync] Error initializing from storage:', error);
    return false;
  }
};

// Set up real-time subscriptions to Supabase with improved error handling
const setupRealtimeSubscriptions = () => {
  console.log('[Sync] Setting up real-time subscriptions...');
  
  try {
    // Create a channel for all tables with specific channel name
    const channelId = `public:all-changes:${deviceId}`;
    console.log(`[Sync] Creating realtime channel: ${channelId}`);
    
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'albums' 
      }, (payload) => {
        console.log('[Sync] Real-time update for albums:', payload);
        // Use a small delay to avoid race conditions
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'stickers' 
      }, (payload) => {
        console.log('[Sync] Real-time update for stickers:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'users' 
      }, (payload) => {
        console.log('[Sync] Real-time update for users:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'exchange_offers' 
      }, (payload) => {
        console.log('[Sync] Real-time update for exchange offers:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('error', (error) => {
        console.error('[Sync] Realtime subscription error:', error);
      });
    
    channel.subscribe((status) => {
      console.log('[Sync] Supabase channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[Sync] Successfully subscribed to real-time updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Sync] Failed to subscribe to real-time updates');
        
        // Try to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.pow(2, reconnectAttempts) * 1000;
          reconnectAttempts++;
          
          console.log(`[Sync] Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          
          setTimeout(() => {
            channel.subscribe();
          }, delay);
        } else {
          console.error('[Sync] Max reconnection attempts reached, falling back to polling');
        }
      }
    });
    
    // Return the channel for cleanup purposes
    return channel;
  } catch (error) {
    console.error('[Sync] Error setting up realtime subscriptions:', error);
    return null;
  }
};

// Sync local data with Supabase with enhanced error handling and conflict resolution
export const syncWithSupabase = async (isInitialSync = false) => {
  if (syncInProgress) {
    pendingSync = true;
    console.log('[Sync] Sync already in progress, scheduling follow-up sync');
    return false;
  }

  try {
    console.log('[Sync] Syncing with Supabase...');
    syncInProgress = true;
    
    // Let the UI know we're starting a sync
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    // Fetch data from Supabase with individual error handling
    const fetchResults = await Promise.allSettled([
      fetchAlbums(),
      fetchStickers(),
      fetchUsers(),
      fetchExchangeOffers()
    ]);
    
    // Process the results even if some failed
    const [albumsResult, stickersResult, usersResult, exchangeOffersResult] = fetchResults;
    
    let albumsData = albumsResult.status === 'fulfilled' ? albumsResult.value : null;
    let stickersData = stickersResult.status === 'fulfilled' ? stickersResult.value : null;
    let usersData = usersResult.status === 'fulfilled' ? usersResult.value : null;
    let exchangeOffersData = exchangeOffersResult.status === 'fulfilled' ? exchangeOffersResult.value : null;
    
    // Log fetch errors
    if (albumsResult.status === 'rejected') {
      console.error('[Sync] Failed to fetch albums:', albumsResult.reason);
    }
    if (stickersResult.status === 'rejected') {
      console.error('[Sync] Failed to fetch stickers:', stickersResult.reason);
    }
    if (usersResult.status === 'rejected') {
      console.error('[Sync] Failed to fetch users:', usersResult.reason);
    }
    if (exchangeOffersResult.status === 'rejected') {
      console.error('[Sync] Failed to fetch exchange offers:', exchangeOffersResult.reason);
    }

    // If we have data from Supabase, update localStorage
    if (albumsData && albumsData.length > 0) {
      console.log(`[Sync] Updating local albums with ${albumsData.length} records from Supabase`);
      saveToStorage('albums', albumsData, false);
    } else if (isInitialSync) {
      // On initial sync, if no remote data and we have local data, upload it
      const localAlbums = getFromStorage('albums', []);
      if (localAlbums && localAlbums.length > 0) {
        console.log(`[Sync] Uploading ${localAlbums.length} local albums to Supabase`);
        await saveBatch('albums', localAlbums);
      }
    }

    if (stickersData && stickersData.length > 0) {
      console.log(`[Sync] Updating local stickers with ${stickersData.length} records from Supabase`);
      saveToStorage('stickers', stickersData, false);
    } else if (isInitialSync) {
      const localStickers = getFromStorage('stickers', []);
      if (localStickers && localStickers.length > 0) {
        console.log(`[Sync] Uploading ${localStickers.length} local stickers to Supabase`);
        await saveBatch('stickers', localStickers);
      }
    }

    if (usersData && usersData.length > 0) {
      console.log(`[Sync] Updating local users with ${usersData.length} records from Supabase`);
      saveToStorage('users', usersData, false);
    } else if (isInitialSync) {
      const localUsers = getFromStorage('users', []);
      if (localUsers && localUsers.length > 0) {
        console.log(`[Sync] Uploading ${localUsers.length} local users to Supabase`);
        await saveBatch('users', localUsers);
      }
    }

    if (exchangeOffersData && exchangeOffersData.length > 0) {
      console.log(`[Sync] Updating local exchange offers with ${exchangeOffersData.length} records from Supabase`);
      saveToStorage('exchangeOffers', exchangeOffersData, false);
    } else if (isInitialSync) {
      const localExchangeOffers = getFromStorage('exchangeOffers', []);
      if (localExchangeOffers && localExchangeOffers.length > 0) {
        console.log(`[Sync] Uploading ${localExchangeOffers.length} local exchange offers to Supabase`);
        await saveBatch('exchange_offers', localExchangeOffers);
      }
    }

    // Update sync tracking
    lastSyncTime = new Date();
    
    // Dispatch sync complete event
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: lastSyncTime }
    }));
    
    console.log('[Sync] Sync complete at', lastSyncTime);
    return true;
  } catch (error) {
    console.error('[Sync] Error syncing with Supabase:', error);
    return false;
  } finally {
    syncInProgress = false;
    
    // If a sync was requested while we were syncing, do another one after a short delay
    if (pendingSync) {
      pendingSync = false;
      setTimeout(() => syncWithSupabase(), 1000);
    }
  }
};

// Save data to localStorage and optionally Supabase with improved error handling
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('[Sync] Storage not available - running in a non-browser environment');
      return;
    }
    
    console.log(`[Sync] Saving ${Array.isArray(data) ? data.length : 1} item(s) to ${key}`);
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Sync to Supabase if required
    if (syncToCloud && isConnected) {
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

// Sync data to Supabase with better error handling and chunking
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
        console.error(`[Sync] Unknown key: ${key}`);
        return;
    }
    
    console.log(`[Sync] Sending ${data.length} items to Supabase table: ${tableName}`);
    
    // Save the data to Supabase with enhanced error handling
    try {
      const result = await saveBatch(tableName, data);
      if (result) {
        console.log(`[Sync] Successfully saved ${data.length} items to ${tableName}`);
      } else {
        console.error(`[Sync] Failed to save items to ${tableName}`);
      }
    } catch (error) {
      console.error(`[Sync] Error sending data to Supabase (${tableName}):`, error);
    }
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

// Get last sync time
export const getLastSyncTime = () => {
  return lastSyncTime;
};

// Check if sync is in progress
export const isSyncInProgress = () => {
  return syncInProgress;
};

// Get connection status
export const isOnline = () => {
  return isConnected;
};

// Force a manual sync
export const forceSync = () => {
  if (!syncInProgress) {
    console.log('[Sync] Manual sync requested');
    return syncWithSupabase();
  }
  console.log('[Sync] Manual sync requested but sync already in progress');
  pendingSync = true;
  return Promise.resolve(false);
};
