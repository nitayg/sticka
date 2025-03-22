
/**
 * Supabase Sync Client
 * מודול זה מספק ממשק פשוט וקל לשימוש לתקשורת עם Supabase
 */
import { StorageEvents } from './constants';
import { supabase } from '../supabase';
import { 
  fetchAlbums, 
  fetchStickers, 
  fetchUsers, 
  fetchExchangeOffers
} from '../supabase';
import { setMemoryStorage } from './storage-utils';

// מעקב אחר מצב הסנכרון
let syncInProgress = false;
let pendingSync = false;
let lastSyncTime: Date | null = null;
let dataTimestamps = {
  albums: 0,
  stickers: 0,
  users: 0,
  exchangeOffers: 0
};

/**
 * אתחול ראשוני של מערכת הסנכרון
 */
export const initializeSync = async () => {
  try {
    console.log('Initializing sync system...');
    
    // ביצוע סנכרון ראשוני מול השרת
    await syncFromCloud(true);
    
    // הפעלת מנגנון הסנכרון בזמן אמת
    setupRealtimeConnection();
    
    // מעקב אחר מצב חיבור לאינטרנט
    window.addEventListener('online', () => {
      console.log('Device is online, triggering sync');
      syncFromCloud();
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline');
    });
    
    // Set up periodic sync at 5-minute intervals
    setInterval(() => {
      if (navigator.onLine && !syncInProgress) {
        console.log('Running periodic sync check');
        syncFromCloud(false, true);
      }
    }, 5 * 60 * 1000);
    
    console.log('Sync system initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing sync system:', error);
    return false;
  }
};

/**
 * מסנכרן נתונים מול Supabase
 * מביא את כל הנתונים מהענן ומעדכן את האחסון המקומי
 * @param isInitialSync האם זה סנכרון ראשוני
 * @param deltaSync האם לבצע סנכרון דלתא (רק שינויים)
 */
export const syncFromCloud = async (isInitialSync = false, deltaSync = false): Promise<boolean> => {
  if (syncInProgress) {
    console.log('Sync already in progress, scheduling follow-up sync');
    pendingSync = true;
    return false;
  }

  try {
    console.log(`Starting ${isInitialSync ? 'initial' : deltaSync ? 'delta' : 'regular'} sync with Supabase...`);
    syncInProgress = true;
    
    // הודעה למשתמש על תחילת הסנכרון
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    // Fetch data selectively based on delta sync
    const promises = [];
    
    if (isInitialSync || !deltaSync) {
      // Full sync - fetch everything
      promises.push(fetchAlbums());
      promises.push(fetchStickers());
      promises.push(fetchUsers());
      promises.push(fetchExchangeOffers());
    } else {
      // Delta sync - only fetch what might have changed
      // In a real implementation, we would add server-side filters based on lastModified
      // or use changes-only API endpoints
      
      // Example implementation - using if statements to decide what to fetch
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;
      
      // Albums don't change often, check every 30 minutes
      if (now - dataTimestamps.albums > FIVE_MINUTES * 6) {
        promises.push(fetchAlbums());
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Stickers change frequently, check every 5 minutes
      promises.push(fetchStickers());
      
      // Users don't change often in this app, check every hour
      if (now - dataTimestamps.users > FIVE_MINUTES * 12) {
        promises.push(fetchUsers());
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Exchange offers change frequently, check every 5 minutes
      promises.push(fetchExchangeOffers());
    }
    
    // Wait for all promises to resolve
    const [albumsData, stickersData, usersData, exchangeOffersData] = await Promise.all(promises);

    // Update only if we received data
    const now = Date.now();
    
    if (albumsData) {
      setMemoryStorage('albums', albumsData);
      dataTimestamps.albums = now;
      window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: albumsData }));
    }
    
    if (stickersData) {
      setMemoryStorage('stickers', stickersData);
      dataTimestamps.stickers = now;
      window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: stickersData }));
    }
    
    if (usersData) {
      setMemoryStorage('users', usersData);
      dataTimestamps.users = now;
      window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: usersData }));
    }
    
    if (exchangeOffersData) {
      setMemoryStorage('exchangeOffers', exchangeOffersData);
      dataTimestamps.exchangeOffers = now;
      window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: exchangeOffersData }));
      window.dispatchEvent(new CustomEvent('exchangeOffersDataChanged', { detail: exchangeOffersData }));
    }

    // עדכון זמן הסנכרון האחרון
    lastSyncTime = new Date();
    
    // הודעה על סיום סנכרון
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: lastSyncTime }
    }));
    
    console.log('Sync completed at', lastSyncTime);
    return true;
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    
    // הודעה על שגיאה בסנכרון
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_ERROR, {
      detail: { error }
    }));
    
    return false;
  } finally {
    syncInProgress = false;
    
    // אם יש סנכרון ממתין, מבצע אותו לאחר השהייה קצרה
    if (pendingSync) {
      pendingSync = false;
      setTimeout(() => syncFromCloud(), 1000);
    }
  }
};

/**
 * מעלה נתונים מקומיים לענן
 * @param entity סוג הישות (albums, stickers, users, exchangeOffers)
 * @param data הנתונים להעלאה
 */
export const pushToCloud = async <T>(
  entity: 'albums' | 'stickers' | 'users' | 'exchangeOffers',
  data: T[]
): Promise<boolean> => {
  if (!data || data.length === 0) {
    console.log(`No ${entity} data to push to cloud`);
    return true;
  }

  try {
    console.log(`Pushing ${data.length} ${entity} to Supabase`);
    
    // הודעה על תחילת העלאה
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    let success = false;
    
    // Batch into smaller groups of 50 items max
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      let batchSuccess = false;
      
      // בחירת הפונקציה המתאימה לפי סוג הישות
      switch (entity) {
        case 'albums':
          batchSuccess = await import('../supabase').then(
            module => module.saveAlbumBatch(batch as any)
          );
          break;
        case 'stickers':
          batchSuccess = await import('../supabase').then(
            module => module.saveStickerBatch(batch as any)
          );
          break;
        case 'users':
          batchSuccess = await import('../supabase').then(
            module => module.saveUserBatch(batch as any)
          );
          break;
        case 'exchangeOffers':
          batchSuccess = await import('../supabase').then(
            module => module.saveExchangeOfferBatch(batch as any)
          );
          break;
        default:
          console.error(`Unknown entity type: ${entity}`);
          return false;
      }
      
      if (!batchSuccess) {
        console.error(`Failed to push batch ${i / BATCH_SIZE + 1} of ${entity} to cloud`);
        success = false;
        break;
      }
      
      success = true;
    }
    
    if (success) {
      // עדכון זמן הסנכרון האחרון
      lastSyncTime = new Date();
      
      // הודעה על סיום העלאה
      window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
        detail: { timestamp: lastSyncTime, entity }
      }));
      
      console.log(`Successfully pushed ${entity} to cloud`);
      return true;
    } else {
      throw new Error(`Failed to push ${entity} to cloud`);
    }
    
  } catch (error) {
    console.error(`Error pushing ${entity} to cloud:`, error);
    
    // הודעה על שגיאה בהעלאה
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_ERROR, {
      detail: { error, entity }
    }));
    
    return false;
  }
};

/**
 * מחזיר את מצב הסנכרון הנוכחי
 */
export const getSyncState = () => ({
  isInProgress: syncInProgress,
  lastSyncTime,
  hasPendingSync: pendingSync
});

/**
 * כופה סנכרון מידי
 */
export const forceSync = async (): Promise<boolean> => {
  if (syncInProgress) {
    console.log('Sync already in progress, cannot force sync now');
    return false;
  }
  
  return await syncFromCloud();
};

// Import the realtime-manager for initialization
import { setupRealtimeConnection } from './realtime-manager';
