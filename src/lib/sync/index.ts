
// Main export file to maintain backward compatibility

// Re-export all functionality from the sync module
export { 
  initializeFromStorage,
  syncWithSupabase,
  getLastSyncTime,
  isSyncInProgress,
  forceSync,
  saveToStorage,
  getFromStorage, 
  isOnline
} from './sync-manager';

export { StorageEvents } from './constants';
