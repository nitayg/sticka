
/**
 * useSyncStatus
 * הוק המספק גישה למצב הסנכרון הנוכחי
 */
import { useState, useEffect } from 'react';
import { StorageEvents, getSyncState, forceSync } from '@/lib/sync';

interface SyncStatus {
  isInProgress: boolean;
  lastSyncTime: Date | null;
  hasPendingSync: boolean;
  triggerSync: () => Promise<boolean>;
}

/**
 * הוק לניהול מצב הסנכרון
 */
export const useSyncStatus = (): SyncStatus => {
  const [status, setStatus] = useState(getSyncState());

  useEffect(() => {
    // עדכון המצב באירועי סנכרון
    const handleSyncStart = () => {
      setStatus(prev => ({ ...prev, isInProgress: true }));
    };
    
    const handleSyncComplete = (event?: CustomEvent) => {
      setStatus({
        isInProgress: false,
        lastSyncTime: event?.detail?.timestamp || new Date(),
        hasPendingSync: false
      });
    };
    
    const handleSyncError = () => {
      setStatus(prev => ({ ...prev, isInProgress: false }));
    };
    
    // רישום למאזינים
    window.addEventListener(StorageEvents.SYNC_START, handleSyncStart);
    window.addEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    window.addEventListener(StorageEvents.SYNC_ERROR, handleSyncError);
    
    // ניקוי מאזינים
    return () => {
      window.removeEventListener(StorageEvents.SYNC_START, handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
      window.removeEventListener(StorageEvents.SYNC_ERROR, handleSyncError);
    };
  }, []);

  return {
    ...status,
    triggerSync: forceSync
  };
};

export default useSyncStatus;
