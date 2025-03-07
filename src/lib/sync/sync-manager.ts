
import { albums, stickers, users, exchangeOffers } from '../initial-data';
import { Album, Sticker, User, ExchangeOffer } from '../types';
import { 
  supabase, 
  fetchAlbums, 
  fetchStickers, 
  fetchUsers, 
  fetchExchangeOffers,
  saveBatch 
} from '../supabase';
import { StorageEvents, deviceId } from './constants';
import { saveToStorage, getFromStorage, isOnline, updateConnectionStatus } from './storage-utils';
import { setupRealtimeSubscriptions } from './realtime-subscriptions';

// Track sync state
let lastSyncTime = null;
let syncInProgress = false;
let pendingSync = false;

// Initialize data from localStorage and Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('[Sync] Initializing data from storage and Supabase...');
    console.log(`[Sync] Device ID: ${deviceId}`);
    
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
      updateConnectionStatus(true);
      syncWithSupabase();
      
      // Notify UI that we're back online
      window.dispatchEvent(new CustomEvent('connection-status-changed', { 
        detail: { isOnline: true } 
      }));
    });

    window.addEventListener('offline', () => {
      console.log('[Sync] Device is offline');
      updateConnectionStatus(false);
      
      // Notify UI that we're offline
      window.dispatchEvent(new CustomEvent('connection-status-changed', { 
        detail: { isOnline: false } 
      }));
    });

    // Initial online check
    updateConnectionStatus(navigator.onLine);
    console.log(`[Sync] Initial connection status: ${isOnline() ? 'online' : 'offline'}`);
    
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

    // Process data for each entity type
    await processEntityData('albums', albumsData, isInitialSync);
    await processEntityData('stickers', stickersData, isInitialSync);  
    await processEntityData('users', usersData, isInitialSync);
    await processEntityData('exchangeOffers', exchangeOffersData, isInitialSync, 'exchange_offers');

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

// Helper function to process entity data during sync
const processEntityData = async (
  storageKey: string, 
  data: any, 
  isInitialSync: boolean,
  tableNameOverride?: string
) => {
  if (data && data.length > 0) {
    console.log(`[Sync] Updating local ${storageKey} with ${data.length} records from Supabase`);
    saveToStorage(storageKey, data, false);
  } else if (isInitialSync) {
    // On initial sync, if no remote data and we have local data, upload it
    const localData = getFromStorage(storageKey, []);
    if (localData && localData.length > 0) {
      console.log(`[Sync] Uploading ${localData.length} local ${storageKey} to Supabase`);
      await saveBatch(tableNameOverride || storageKey, localData);
    }
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

// Re-export other functions for backward compatibility
export { saveToStorage, getFromStorage, isOnline, StorageEvents } from './index';
