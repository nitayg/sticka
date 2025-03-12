
import { StorageEvents } from './constants';
import { getFromStorage, saveToStorage, setIsConnected, getIsConnected, setMemoryStorage } from './storage-utils';
import { mergeData } from './merge-utils';
import { setupRealtimeSubscriptions, reconnectRealtimeChannel } from './realtime-subscriptions';
import { 
  fetchAlbums, 
  fetchStickers, 
  fetchUsers, 
  fetchExchangeOffers,
  saveAlbumBatch,
  saveStickerBatch,
  saveUserBatch,
  saveExchangeOfferBatch
} from '../supabase';
import { Album, Sticker, User, ExchangeOffer } from '../types';

// Track sync state
let lastSyncTime: Date | null = null;
let syncInProgress = false;
let pendingSync = false;
let realtimeChannel: ReturnType<typeof setupRealtimeSubscriptions> | null = null;

// Initialize data directly from Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('Initializing data from Supabase...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Running in a non-browser environment');
      return;
    }

    // Initial load from Supabase
    await syncWithSupabase(true);

    // Listen for online status changes
    window.addEventListener('online', () => {
      console.log('Device is online, triggering sync');
      setIsConnected(true);
      syncWithSupabase();
      
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
    
    // Listen for Supabase real-time updates
    realtimeChannel = setupRealtimeSubscriptions();
    
    console.log('Storage initialization complete');
  } catch (error) {
    console.error('Error initializing from storage:', error);
  }
};

// Sync data directly with Supabase - only get data from cloud, not from local storage
export const syncWithSupabase = async (isInitialSync = false) => {
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
    
    // Fetch data from Supabase
    const [albumsData, stickersData, usersData, exchangeOffersData] = await Promise.all([
      fetchAlbums(),
      fetchStickers(),
      fetchUsers(),
      fetchExchangeOffers()
    ]);

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
    
    // Dispatch sync complete event (without toast notification)
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: lastSyncTime }
    }));
    
    console.log('Sync complete at', lastSyncTime);
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
  } finally {
    syncInProgress = false;
    
    // If a sync was requested while we were syncing, do another one
    if (pendingSync) {
      pendingSync = false;
      setTimeout(() => syncWithSupabase(), 1000);
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
    return syncWithSupabase();
  }
  return Promise.resolve(false);
};

// Export the realtimeChannel for external access if needed
export const getRealtimeChannel = () => realtimeChannel;
