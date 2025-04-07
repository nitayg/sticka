
import { StorageEvents } from './constants';
import { getFromStorage, saveToStorage, setIsConnected, getIsConnected, setMemoryStorage } from './storage-utils';
import { mergeData } from './merge-utils';
import { setupRealtimeSubscriptions, reconnectRealtimeChannel } from './realtime-subscriptions';

// Track sync state
let lastSyncTime = null;
let syncInProgress = false;
let pendingSync = false;
let realtimeChannel = null;
let lastEgressError = null;

// Cache data to prevent redundant fetches
const dataCache = {
  albums: null,
  stickers: null,
  users: null,
  exchangeOffers: null,
  lastFetched: {
    albums: null,
    stickers: null,
    users: null,
    exchangeOffers: null
  }
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Initialize data directly from Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('Initializing data from Supabase...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Running in a non-browser environment');
      return;
    }

    // Initial load from Supabase (with reduced frequency)
    await syncWithSupabase(true);

    // Listen for online status changes
    window.addEventListener('online', () => {
      console.log('Device is online, triggering sync');
      setIsConnected(true);
      
      // Don't sync immediately, use a throttled approach
      setTimeout(() => syncWithSupabase(), 2000);
      
      // Reconnect realtime channel if it exists
      if (realtimeChannel) {
        reconnectRealtimeChannel(realtimeChannel);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline');
      setIsConnected(false);
    });

    // Initial online check
    setIsConnected(navigator.onLine);
    console.log(`Initial connection status: ${getIsConnected() ? 'online' : 'offline'}`);
    
    // Listen for Supabase real-time updates - only set up once!
    if (!realtimeChannel) {
      realtimeChannel = setupRealtimeSubscriptions();
    }
    
    console.log('Storage initialization complete');
  } catch (error) {
    console.error('Error initializing from storage:', error);
  }
};

// Helper function to check if cache is still valid
const isCacheValid = (entityType) => {
  if (!dataCache.lastFetched[entityType]) return false;
  
  const now = new Date().getTime();
  const lastFetch = dataCache.lastFetched[entityType].getTime();
  return (now - lastFetch) < CACHE_TTL;
};

// Sync data directly with Supabase - only get data from cloud, not from local storage
export const syncWithSupabase = async (isInitialSync = false) => {
  // If we had an egress error recently, wait before trying again
  if (lastEgressError) {
    const timeSinceError = new Date().getTime() - lastEgressError.getTime();
    if (timeSinceError < 300000) { // 5 minute cooldown (increased from 1 min)
      console.log(`Skipping sync due to recent egress error (${Math.round(timeSinceError/1000)}s ago)`);
      return;
    }
  }
  
  if (syncInProgress) {
    pendingSync = true;
    console.log('Sync already in progress, scheduling follow-up sync');
    return;
  }

  try {
    console.log('Syncing with Supabase...');
    syncInProgress = true;
    
    // Let the UI know we're starting a sync
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    // Import functions dynamically to reduce initial load
    const { fetchAlbums, fetchStickers, fetchUsers, fetchExchangeOffers } = await import('../supabase');
    
    // Fetch only data that isn't cached or needs refreshing
    const promises = [];
    let albumsData = null, stickersData = null, usersData = null, exchangeOffersData = null;
    
    if (!dataCache.albums || !isCacheValid('albums') || isInitialSync) {
      promises.push(fetchAlbums().then(data => {
        albumsData = data;
        if (data) {
          dataCache.albums = data;
          dataCache.lastFetched.albums = new Date();
        }
      }));
    } else {
      console.log('Using cached albums data');
      albumsData = dataCache.albums;
    }
    
    if (!dataCache.stickers || !isCacheValid('stickers') || isInitialSync) {
      promises.push(fetchStickers().then(data => {
        stickersData = data;
        if (data) {
          dataCache.stickers = data;
          dataCache.lastFetched.stickers = new Date();
        }
      }));
    } else {
      console.log('Using cached stickers data');
      stickersData = dataCache.stickers;
    }
    
    if (!dataCache.users || !isCacheValid('users') || isInitialSync) {
      promises.push(fetchUsers().then(data => {
        usersData = data;
        if (data) {
          dataCache.users = data;
          dataCache.lastFetched.users = new Date();
        }
      }));
    } else {
      console.log('Using cached users data');
      usersData = dataCache.users;
    }
    
    if (!dataCache.exchangeOffers || !isCacheValid('exchangeOffers') || isInitialSync) {
      promises.push(fetchExchangeOffers().then(data => {
        exchangeOffersData = data;
        if (data) {
          dataCache.exchangeOffers = data;
          dataCache.lastFetched.exchangeOffers = new Date();
        }
      }));
    } else {
      console.log('Using cached exchange offers data');
      exchangeOffersData = dataCache.exchangeOffers;
    }
    
    if (promises.length > 0) {
      console.log(`Fetching fresh data for ${promises.length} data types`);
      await Promise.all(promises);
    } else {
      console.log('All data is cached, no need to fetch from Supabase');
    }

    // Store fetched data directly in memory (no localStorage)
    if (albumsData) {
      setMemoryStorage('albums', albumsData);
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: albumsData }));
    }
    
    if (stickersData) {
      setMemoryStorage('stickers', stickersData);
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: stickersData }));
    }
    
    if (usersData) {
      setMemoryStorage('users', usersData);
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: usersData }));
    }
    
    if (exchangeOffersData) {
      setMemoryStorage('exchangeOffers', exchangeOffersData);
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: exchangeOffersData }));
      // Also dispatch a custom event for exchange offers
      window.dispatchEvent(new CustomEvent('exchangeOffersDataChanged', { detail: exchangeOffersData }));
    }

    // Update sync tracking
    lastSyncTime = new Date();
    lastEgressError = null; // Reset error state on successful sync
    
    // Dispatch sync complete event (without toast notification)
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: lastSyncTime }
    }));
    
    console.log('Sync complete at', lastSyncTime);
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    
    // Check if this is an egress limit error
    if (error?.message?.includes('egress') || 
        error?.message?.includes('exceeded') || 
        error?.message?.includes('limit') ||
        error?.code === '429') {
      lastEgressError = new Date();
      console.warn('Egress limit detected, will throttle future sync requests');
    }
  } finally {
    syncInProgress = false;
    
    // If a sync was requested while we were syncing, do another one after a delay
    if (pendingSync) {
      pendingSync = false;
      setTimeout(() => syncWithSupabase(), 5000); // Increased from 1000ms to 5000ms
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

// Check if we're in egress limit cooldown
export const isEgressLimitCooldown = () => {
  if (!lastEgressError) return false;
  const timeSinceError = new Date().getTime() - lastEgressError.getTime();
  return timeSinceError < 300000; // 5 minute cooldown (increased from 1 min)
};

// Force a manual sync
export const forceSync = () => {
  if (!syncInProgress) {
    return syncWithSupabase();
  }
  return Promise.resolve(false);
};

// Export the realtimeChannel for external access if needed
export const getRealtimeChannel = () => realtimeChannel;

// Clear cache to force fresh data on next sync
export const clearCache = () => {
  console.log('Clearing data cache');
  dataCache.albums = null;
  dataCache.stickers = null;
  dataCache.users = null;
  dataCache.exchangeOffers = null;
  dataCache.lastFetched.albums = null;
  dataCache.lastFetched.stickers = null;
  dataCache.lastFetched.users = null;
  dataCache.lastFetched.exchangeOffers = null;
};
