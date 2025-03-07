
// Main export file to maintain backward compatibility

// Re-export all functionality from the sync module
export { 
  initializeFromStorage,
  syncWithSupabase,
  getLastSyncTime,
  isSyncInProgress,
  forceSync
} from './sync-manager';

export {
  saveToStorage,
  getFromStorage, 
  isOnline
} from './storage-utils';

export { StorageEvents } from './constants';
