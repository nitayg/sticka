
/**
 * Sync Module Index
 * נקודת הכניסה הראשית למודול הסנכרון
 */
// ייצוא קבועים
export * from './constants';

// ייצוא פונקציות הסנכרון המרכזיות
export {
  syncFromCloud,
  pushToCloud,
  getSyncState,
  forceSync,
} from './sync-client';

// ייצוא פונקציות ניהול מצב
export {
  getAlbumData,
  getStickerData,
  getUserData,
  getExchangeOfferData,
  setAlbumData,
  setStickerData,
  setUserData,
  setExchangeOfferData,
} from './state-manager';

// ייצוא פונקציות ניהול תקשורת בזמן אמת
export {
  setupRealtimeConnection,
  reconnectRealtimeChannel,
  getRealtimeChannel,
} from './realtime-manager';

// ייצוא פונקציות אחסון
export * from './storage-utils';

// Sync module aliases to maintain compatibility with existing code
export { initializeSync as initializeFromStorage } from './sync-client';
export { syncFromCloud as syncWithSupabase } from './sync-client';

// אתחול מערכת סנכרון
import { syncFromCloud } from './sync-client';
import { setupRealtimeConnection } from './realtime-manager';

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
