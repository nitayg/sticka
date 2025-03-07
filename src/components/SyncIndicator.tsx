
import { useState, useEffect } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { StorageEvents, isSyncInProgress, getLastSyncTime, forceSync } from "@/lib/sync-manager";

const SyncIndicator = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for sync events
    const handleSyncStart = () => {
      console.log("Sync started");
      setIsSyncing(true);
    };

    const handleSyncComplete = () => {
      console.log("Sync completed");
      setIsSyncing(false);
    };
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger a sync when we come back online
      forceSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Register event listeners
    window.addEventListener(StorageEvents.SYNC_START, handleSyncStart);
    window.addEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize state from sync manager
    setIsSyncing(isSyncInProgress());

    // Trigger an initial sync when component mounts (only if we're online)
    const initialSyncTimeout = setTimeout(() => {
      if (!isSyncInProgress() && navigator.onLine) {
        forceSync();
      }
    }, 1000);

    return () => {
      // Clean up event listeners
      window.removeEventListener(StorageEvents.SYNC_START, handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(initialSyncTimeout);
    };
  }, []);

  // Determine what to show
  let indicatorToShow;
  
  if (!isOnline) {
    // Offline indicator
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm">אין חיבור</span>
      </div>
    );
  } else if (isSyncing) {
    // Syncing indicator
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-interactive text-interactive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md animate-in fade-in">
        <Loader2 className="animate-spin h-4 w-4" />
        <span className="text-sm">מסנכרן...</span>
      </div>
    );
  } else {
    // Nothing to show when idle
    indicatorToShow = null;
  }

  return indicatorToShow;
};

export default SyncIndicator;
