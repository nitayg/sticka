import { albums, stickers, users, exchangeOffers } from './initial-data';
import { Album, Sticker, User, ExchangeOffer } from './types';
import { 
  supabase, 
  fetchAlbums, 
  fetchStickers, 
  fetchUsers, 
  fetchExchangeOffers,
  saveAlbumBatch,
  saveStickerBatch,
  saveUserBatch,
  saveExchangeOfferBatch
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
let pendingSync = false;

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

// Set up real-time subscriptions to Supabase - trigger sync only on changes
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
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'stickers' 
    }, (payload) => {
      console.log('Real-time update for stickers:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users' 
    }, (payload) => {
      console.log('Real-time update for users:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'exchange_offers' 
    }, (payload) => {
      console.log('Real-time update for exchange offers:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    });
  
  channel.subscribe((status) => {
    console.log('Supabase channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to real-time updates');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to real-time updates');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        channel.subscribe();
      }, 5000);
    }
  });
};

// Merge data from remote and local sources
const mergeData = <T extends { id: string; lastModified?: number }>(
  localData: T[], 
  remoteData: T[]
): T[] => {
  const mergedMap = new Map<string, T>();
  
  // First add all local items to the map
  localData.forEach(item => {
    mergedMap.set(item.id, { ...item });
  });
  
  // Then process remote items - keep the newer version based on lastModified
  remoteData.forEach(remoteItem => {
    const localItem = mergedMap.get(remoteItem.id);
    const remoteLastModified = remoteItem.lastModified || 0;
    const localLastModified = localItem?.lastModified || 0;
    
    // If the remote item is newer, or if it's marked as deleted and local isn't, use remote
    if (!localItem || remoteLastModified > localLastModified || 
        ((remoteItem as any).isDeleted && !(localItem as any).isDeleted)) {
      mergedMap.set(remoteItem.id, { ...remoteItem });
    }
  });
  
  return Array.from(mergedMap.values());
};

// Filter out soft-deleted items for display
const filterDeleted = <T>(items: T[]): T[] => {
  return items.filter(item => {
    // Only keep items where isDeleted is not true
    const typedItem = item as any;
    return !typedItem.isDeleted;
  });
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

    // Get local data
    const localAlbums = getFromStorage<Album[]>('albums', []);
    const localStickers = getFromStorage<Sticker[]>('stickers', []);
    const localUsers = getFromStorage<User[]>('users', []);
    const localExchangeOffers = getFromStorage<ExchangeOffer[]>('exchangeOffers', []);
    
    // Merge and save data, respecting deletions and modifications
    if (albumsData && albumsData.length > 0) {
      const mergedAlbums = mergeData(localAlbums, albumsData);
      saveToStorage('albums', mergedAlbums, false);
    } else if (isInitialSync && localAlbums.length > 0) {
      console.log('Uploading local albums to Supabase');
      await saveAlbumBatch(localAlbums);
    }

    if (stickersData && stickersData.length > 0) {
      const mergedStickers = mergeData(localStickers, stickersData);
      saveToStorage('stickers', mergedStickers, false);
    } else if (isInitialSync && localStickers.length > 0) {
      console.log('Uploading local stickers to Supabase');
      await saveStickerBatch(localStickers);
    }

    if (usersData && usersData.length > 0) {
      const mergedUsers = mergeData(localUsers, usersData);
      saveToStorage('users', mergedUsers, false);
    } else if (isInitialSync && localUsers.length > 0) {
      console.log('Uploading local users to Supabase');
      await saveUserBatch(localUsers);
    }

    if (exchangeOffersData && exchangeOffersData.length > 0) {
      const mergedExchangeOffers = mergeData(localExchangeOffers, exchangeOffersData);
      saveToStorage('exchangeOffers', mergedExchangeOffers, false);
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
    } catch (error) {
      console.error(`Error sending data to Supabase (${key}):`, error);
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
    
    const parsedData = JSON.parse(storedData) as T;
    
    // If we're getting albums or other data that might have soft-deleted items,
    // filter them out for UI purposes unless explicitly requested with includeDeleted
    if (Array.isArray(parsedData) && key !== 'recycleBin') {
      // Cast to any to check if items have isDeleted property
      const dataArray = parsedData as any[];
      return filterDeleted(dataArray) as unknown as T;
    }
    
    return parsedData;
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

// Force a manual sync
export const forceSync = () => {
  if (!syncInProgress) {
    return syncWithSupabase();
  }
  return Promise.resolve(false);
};
