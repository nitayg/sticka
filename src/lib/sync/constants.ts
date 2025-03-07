
// Event names for storage events with more consistent naming
export const StorageEvents = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated',
  SYNC_COMPLETE: 'sync-complete',
  SYNC_START: 'sync-start'
};

// Configuration constants
export const MAX_RECONNECT_ATTEMPTS = 5;

// Generate a device identifier for debugging
export const deviceId = `device_${Math.random().toString(36).substring(2, 9)}`;
