
/**
 * Synchronization manager responsible for keeping local data in sync
 * with Supabase. Most functions here are used by the UI to trigger
 * manual or automatic sync operations.
 */
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

// Cache TTL in milliseconds (30 minutes - increased from 5)
const CACHE_TTL = 30 * 60 * 1000;

// Per-album sticker cache to avoid fetching all stickers
const perAlbumStickerCache: Record<string, {
  data: any[] | null;
  timestamp: number;
}> = {};

/**
 * Load initial data from Supabase and register network event listeners.
 */
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
      setTimeout(() => syncWithSupabase(), 5000); // Increased from 2000
      
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

/**
 * Fetch stickers for a specific album. Results are cached per album
 * to keep network usage low and avoid hitting egress limits.
 */
export const getAlbumStickers = async (albumId: string) => {
  if (!albumId) return [];
  
  // Check if we have a fresh cache for this album
  const now = Date.now();
  if (perAlbumStickerCache[albumId] && 
      now - perAlbumStickerCache[albumId].timestamp < CACHE_TTL) {
    console.log(`Using cached stickers for album ${albumId}, age: ${Math.round((now - perAlbumStickerCache[albumId].timestamp)/1000)}s`);
    return perAlbumStickerCache[albumId].data || [];
  }
  
  // We had an egress error recently, use whatever data we have
  if (lastEgressError && now - lastEgressError.getTime() < 300000) {
    console.log(`Using potentially stale data due to recent egress error`);
    return perAlbumStickerCache[albumId]?.data || [];
  }
  
  try {
    // Import function dynamically to reduce initial load
    const { fetchStickersByAlbumId } = await import('../supabase/stickers');
    
    // Fetch only stickers for this specific album
    console.log(`Fetching fresh stickers for album ${albumId} from Supabase`);
    const data = await fetchStickersByAlbumId(albumId);
    
    // Cache the result
    perAlbumStickerCache[albumId] = {
      data,
      timestamp: now
    };
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching stickers for album ${albumId}:`, error);
    
    // Check if this is an egress limit error
    if (error?.message?.includes('egress') || 
        error?.message?.includes('exceeded') || 
        error?.message?.includes('limit') ||
        error?.code === '429') {
      lastEgressError = new Date();
      console.warn('Egress limit detected, will throttle future requests');
    }
    
    // Return cached data if available (even if stale)
    return perAlbumStickerCache[albumId]?.data || [];
  }
};

/**
 * Perform a full sync with Supabase. Existing cached data is reused
 * whenever possible to minimise network traffic.
 */
export const syncWithSupabase = async (isInitialSync = false) => {
  // If we had an egress error recently, wait before trying again
  if (lastEgressError) {
    const timeSinceError = new Date().getTime() - lastEgressError.getTime();
    if (timeSinceError < 600000) { // 10 minute cooldown (increased from 5 min)
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
    const { fetchAlbums, fetchUsers, fetchExchangeOffers } = await import('../supabase');
    
    // Fetch only data that isn't cached or needs refreshing
    const promises = [];
    let albumsData = null, usersData = null, exchangeOffersData = null;
    
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
    
    // IMPROVED: No longer fetching all stickers - will fetch per album as needed
    // This is a major improvement to reduce egress
    
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
    
    // No longer fetching all stickers at once
    
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
      setTimeout(() => syncWithSupabase(), 10000); // Increased from 5000ms to 10000ms
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
  return timeSinceError < 600000; // 10 minute cooldown (increased from 5 min)
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

// Clear cache to force fresh data on next sync - export this function for external access
export const clearCache = () => {
  // Clear all caches
  Object.keys(dataCache).forEach(key => {
    if (key !== 'lastFetched') {
      dataCache[key] = null;
    }
  });
  
  // Clear per-album cache
  Object.keys(perAlbumStickerCache).forEach(key => {
    delete perAlbumStickerCache[key];
  });
  
  console.log('All caches cleared');
  window.dispatchEvent(new CustomEvent('cacheCleared'));
};

// Export the album stickers fetch function (only once)
// We removed the duplicate export to avoid conflicts
