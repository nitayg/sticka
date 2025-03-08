import { StorageEvents } from './constants';
import { getFromStorage, saveToStorage, setIsConnected, getIsConnected } from './storage-utils';
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

// Sync local data with Supabase - only triggered by explicit actions, not automatically
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

    // Get local data (including deleted items)
    const localAlbums = getFromStorage<Album[]>('albums', [], true);
    const localStickers = getFromStorage<Sticker[]>('stickers', [], true);
    const localUsers = getFromStorage<User[]>('users', [], true);
    const localExchangeOffers = getFromStorage<ExchangeOffer[]>('exchangeOffers', [], true);
    
    // Merge and save data, respecting deletions and modifications
    if (albumsData && albumsData.length > 0) {
      // Filter out any local albums that have been deleted from Supabase
      const supabaseAlbumIds = albumsData.map(album => album.id);
      
      // Keep only local albums that still exist on the server or ones that haven't been synchronized yet
      const filteredLocalAlbums = localAlbums.filter(album => 
        supabaseAlbumIds.includes(album.id) || !album.lastModified // Keep newly created albums that haven't been synced
      );
      
      const mergedAlbums = mergeData(filteredLocalAlbums, albumsData);
      saveToStorage('albums', mergedAlbums, false);
      
      // Make sure to upload all albums back to Supabase
      await saveAlbumBatch(mergedAlbums);
    } else if (isInitialSync && localAlbums.length > 0) {
      console.log('Uploading local albums to Supabase');
      await saveAlbumBatch(localAlbums);
    }

    if (stickersData && stickersData.length > 0) {
      // Get list of deleted album IDs
      const deletedAlbumIds = [...localAlbums, ...(albumsData || [])]
        .filter(album => album.isDeleted)
        .map(album => album.id);
      
      // Mark stickers as deleted if their album is deleted
      const updatedLocalStickers = localStickers.map(sticker => 
        sticker.albumId && deletedAlbumIds.includes(sticker.albumId) 
          ? { ...sticker, isDeleted: true } 
          : sticker
      );
      
      const mergedStickers = mergeData(updatedLocalStickers, stickersData);
      saveToStorage('stickers', mergedStickers, false);
      
      // Make sure to upload all stickers (including deleted ones) back to Supabase
      await saveStickerBatch(mergedStickers);
    } else if (isInitialSync && localStickers.length > 0) {
      console.log('Uploading local stickers to Supabase');
      await saveStickerBatch(localStickers);
    }

    if (usersData && usersData.length > 0) {
      const mergedUsers = mergeData(localUsers, usersData);
      saveToStorage('users', mergedUsers, false);
      
      // Make sure to upload all users (including deleted ones) back to Supabase
      await saveUserBatch(mergedUsers);
    } else if (isInitialSync && localUsers.length > 0) {
      console.log('Uploading local users to Supabase');
      await saveUserBatch(localUsers);
    }

    if (exchangeOffersData && exchangeOffersData.length > 0) {
      const mergedExchangeOffers = mergeData(localExchangeOffers, exchangeOffersData);
      saveToStorage('exchangeOffers', mergedExchangeOffers, false);
      
      // Make sure to upload all exchange offers (including deleted ones) back to Supabase
      await saveExchangeOfferBatch(mergedExchangeOffers);
    } else if (isInitialSync && localExchangeOffers.length > 0) {
      console.log('Uploading local exchange offers to Supabase');
      await saveExchangeOfferBatch(localExchangeOffers);
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
