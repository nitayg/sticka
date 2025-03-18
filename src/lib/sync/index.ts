
/**
 * Sync Module Index
 * נקודת הכניסה הראשית למודול הסנכרון
 */
// ייצוא קבועים
export * from './constants';

// ייצוא פונקציות הסנכרון המרכזיות
export {
  initializeSync,
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
