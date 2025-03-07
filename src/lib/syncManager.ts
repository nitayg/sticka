
// מודול לניהול מתקדם של סנכרון עם הגבלת תדירות וניהול מצב
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 דקות בין סנכרונים
let lastSyncTime = 0;
let syncInProgress = false;
let syncScheduled = false;

/**
 * בודק אם מותר לבצע סנכרון לפי מגבלת הזמן
 */
export function canSync() {
  const now = Date.now();
  return now - lastSyncTime >= SYNC_INTERVAL_MS && !syncInProgress;
}

/**
 * מסמן שהתחיל סנכרון ומעדכן את זמן הסנכרון האחרון
 */
export function markSyncStarted() {
  syncInProgress = true;
  lastSyncTime = Date.now();
}

/**
 * מסמן שהסתיים סנכרון
 */
export function markSyncCompleted() {
  syncInProgress = false;
}

/**
 * מתזמן סנכרון עתידי אם צריך
 */
export function scheduleFutureSyncIfNeeded() {
  if (syncScheduled) return;
  
  syncScheduled = true;
  console.log('תזמון סנכרון עתידי');
  
  setTimeout(() => {
    syncScheduled = false;
    // כאן יש להפעיל את פונקציית הסנכרון העיקרית או לשלוח אירוע
    window.dispatchEvent(new CustomEvent('triggerSync'));
  }, SYNC_INTERVAL_MS);
}

/**
 * כופה סנכרון מיידי על ידי איפוס טיימר הסנכרון האחרון
 */
export function forceSync() {
  lastSyncTime = 0; // איפוס הטיימר כדי לאפשר סנכרון מיידי
}

/**
 * מחזיר את זמן הסנכרון האחרון
 */
export function getLastSyncTime() {
  return lastSyncTime;
}

/**
 * בודק אם סנכרון נמצא בתהליך
 */
export function isSyncInProgress() {
  return syncInProgress;
}
