
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
import { 
  canSync,
  markSyncStarted,
  markSyncCompleted,
  scheduleFutureSyncIfNeeded,
  forceSync as forceSyncManager,
  getLastSyncTime as getSyncManagerLastTime,
  isSyncInProgress as isSyncManagerInProgress
} from './syncManager';

// Event names for storage events
export const StorageEvents = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated',
  SYNC_COMPLETE: 'sync-complete',
  SYNC_START: 'sync-start'
};

// Track connection state
let isConnected = false;

// Initialize data from localStorage and Supabase
export const initializeFromStorage = async () => {
  try {
    console.log('מאתחל נתונים מאחסון ו-Supabase...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('אחסון לא זמין - רץ בסביבה שאינה דפדפן');
      return;
    }

    // Initial load from Supabase
    await syncWithSupabase(true);

    // Listen for online status changes
    window.addEventListener('online', () => {
      console.log('מכשיר מחובר לרשת, מפעיל סנכרון');
      isConnected = true;
      syncWithSupabase();
    });

    window.addEventListener('offline', () => {
      console.log('מכשיר מנותק מהרשת');
      isConnected = false;
    });

    // Initial online check
    isConnected = navigator.onLine;
    console.log(`סטטוס חיבור ראשוני: ${isConnected ? 'מחובר' : 'מנותק'}`);
    
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
    
    // Listen for trigger sync events
    window.addEventListener('triggerSync', () => {
      syncWithSupabase();
    });
    
    console.log('אתחול אחסון הושלם');
  } catch (error) {
    console.error('שגיאה באתחול מאחסון:', error);
  }
};

// Set up real-time subscriptions to Supabase - trigger sync only on changes
const setupRealtimeSubscriptions = () => {
  console.log('הגדרת מינויים בזמן אמת...');
  
  // Create a channel for all tables
  const channel = supabase.channel('public:all-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'albums' 
    }, (payload) => {
      console.log('עדכון בזמן אמת עבור אלבומים:', payload);
      // זיהוי עדכון במחיקה רכה ואיתחול סנכרון כאשר יש שינוי במחיקות
      if (payload.new && payload.old && 
          payload.new.isdeleted !== payload.old.isdeleted) {
        console.log('זוהה שינוי במצב מחיקה, מפעיל סנכרון...');
        syncWithSupabase();
      }
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'stickers' 
    }, (payload) => {
      console.log('עדכון בזמן אמת עבור מדבקות:', payload);
      // עדכון סנכרון במקרה של שינוי במחיקות
      if (payload.new && payload.old && 
          (payload.new as any).isdeleted !== (payload.old as any).isdeleted) {
        syncWithSupabase();
      }
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users' 
    }, (payload) => {
      console.log('עדכון בזמן אמת עבור משתמשים:', payload);
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'exchange_offers' 
    }, (payload) => {
      console.log('עדכון בזמן אמת עבור הצעות החלפה:', payload);
    });
  
  channel.subscribe((status) => {
    console.log('סטטוס ערוץ Supabase:', status);
    if (status === 'SUBSCRIBED') {
      console.log('נרשם בהצלחה לעדכונים בזמן אמת');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('נכשל ברישום לעדכונים בזמן אמת');
      
      // ניסיון מחדש אחרי עיכוב
      setTimeout(() => {
        channel.subscribe();
      }, 5000);
    }
  });
};

// Sync local data with Supabase - with enhanced control using syncManager
export const syncWithSupabase = async (isInitialSync = false) => {
  // בדיקה אם מותר לבצע סנכרון לפי מגבלות הזמן
  if (!isInitialSync && !canSync()) {
    console.log('סנכרון אחרון בוצע לאחרונה, מתזמן סנכרון עתידי');
    scheduleFutureSyncIfNeeded();
    return;
  }

  try {
    console.log('מסנכרן עם Supabase...');
    markSyncStarted(); // סימון שהסנכרון התחיל
    
    // יידוע ממשק המשתמש שמתחיל סנכרון
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
        console.log('מעלה אלבומים מקומיים ל-Supabase');
        await saveBatch('albums', localAlbums);
      }
    }

    if (stickersData && stickersData.length > 0) {
      saveToStorage('stickers', stickersData, false);
    } else if (isInitialSync) {
      const localStickers = getFromStorage('stickers', []);
      if (localStickers && localStickers.length > 0) {
        console.log('מעלה מדבקות מקומיות ל-Supabase');
        await saveBatch('stickers', localStickers);
      }
    }

    if (usersData && usersData.length > 0) {
      saveToStorage('users', usersData, false);
    } else if (isInitialSync) {
      const localUsers = getFromStorage('users', []);
      if (localUsers && localUsers.length > 0) {
        console.log('מעלה משתמשים מקומיים ל-Supabase');
        await saveBatch('users', localUsers);
      }
    }

    if (exchangeOffersData && exchangeOffersData.length > 0) {
      saveToStorage('exchangeOffers', exchangeOffersData, false);
    } else if (isInitialSync) {
      const localExchangeOffers = getFromStorage('exchangeOffers', []);
      if (localExchangeOffers && localExchangeOffers.length > 0) {
        console.log('מעלה הצעות החלפה מקומיות ל-Supabase');
        await saveBatch('exchange_offers', localExchangeOffers);
      }
    }
    
    // יידוע ממשק המשתמש שהסנכרון הושלם
    window.dispatchEvent(new CustomEvent(StorageEvents.SYNC_COMPLETE, {
      detail: { timestamp: new Date() }
    }));
    
    console.log('סנכרון הושלם ב-', new Date().toString());
  } catch (error) {
    console.error('שגיאה בסנכרון עם Supabase:', error);
  } finally {
    markSyncCompleted(); // סימון שהסנכרון הסתיים
  }
};

// Save data to localStorage and optionally Supabase
export const saveToStorage = <T>(key: string, data: T, syncToCloud = true): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('אחסון לא זמין - רץ בסביבה שאינה דפדפן');
      return;
    }
    
    console.log(`שומר ${Array.isArray(data) ? data.length : 1} פריט(ים) ל-${key}`);
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Sync to Supabase if required
    if (syncToCloud && isConnected) {
      console.log(`מסנכרן ${key} ל-Supabase`);
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
    console.error(`שגיאה בשמירת ${key} לאחסון:`, error);
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
        console.error(`מפתח לא מוכר: ${key}`);
        return;
    }
    
    console.log(`שולח ${data.length} פריטים לטבלת Supabase: ${tableName}`);
    
    // Save the data to Supabase
    try {
      await saveBatch(tableName, data);
    } catch (error) {
      console.error(`שגיאה בשליחת נתונים ל-Supabase (${tableName}):`, error);
    }
  }
};

// Get data from localStorage with error handling
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('אחסון לא זמין - רץ בסביבה שאינה דפדפן');
      return defaultValue;
    }
    
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`שגיאה בקבלת ${key} מאחסון:`, error);
    return defaultValue;
  }
};

// Get last sync time
export const getLastSyncTime = () => {
  return getSyncManagerLastTime();
};

// Check if sync is in progress
export const isSyncInProgress = () => {
  return isSyncManagerInProgress();
};

// Force a manual sync
export const forceSync = () => {
  // איפוס הטיימר במנהל הסנכרון
  forceSyncManager();
  return syncWithSupabase();
};
