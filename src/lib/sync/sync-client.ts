
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
 */
export const syncFromCloud = async (isInitialSync = false): Promise<boolean> => {
  if (syncInProgress) {
    console.log('Sync already in progress, scheduling follow-up sync');
    pendingSync = true;
    return false;
  }

  try {
    console.log(`Starting ${isInitialSync ? 'initial' : 'regular'} sync with Supabase...`);
    syncInProgress = true;
    
    // הודעה למשתמש על תחילת הסנכרון
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_START));
    
    // מביא את הנתונים במקביל מהשרת
    const [albumsData, stickersData, usersData, exchangeOffersData] = await Promise.all([
      fetchAlbums(),
      fetchStickers(),
      fetchUsers(),
      fetchExchangeOffers()
    ]);

    // שומר את הנתונים בזיכרון (לא ב-localStorage)
    if (albumsData) {
      setMemoryStorage('albums', albumsData);
      // שולח אירוע לעדכון ממשק המשתמש
      window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: albumsData }));
    }
    
    if (stickersData) {
      setMemoryStorage('stickers', stickersData);
      window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: stickersData }));
    }
    
    if (usersData) {
      setMemoryStorage('users', usersData);
      window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: usersData }));
    }
    
    if (exchangeOffersData) {
      setMemoryStorage('exchangeOffers', exchangeOffersData);
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
    
    // בחירת הפונקציה המתאימה לפי סוג הישות
    switch (entity) {
      case 'albums':
        success = await import('../supabase').then(
          module => module.saveAlbumBatch(data as any)
        );
        break;
      case 'stickers':
        success = await import('../supabase').then(
          module => module.saveStickerBatch(data as any)
        );
        break;
      case 'users':
        success = await import('../supabase').then(
          module => module.saveUserBatch(data as any)
        );
        break;
      case 'exchangeOffers':
        success = await import('../supabase').then(
          module => module.saveExchangeOfferBatch(data as any)
        );
        break;
      default:
        console.error(`Unknown entity type: ${entity}`);
        return false;
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
