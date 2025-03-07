
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, WifiOff } from "lucide-react";
import { StorageEvents, isSyncInProgress, getLastSyncTime, forceSync } from "@/lib/sync-manager";

const SyncIndicator = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Listen for sync events
    const handleSyncStart = () => {
      console.log("Sync started");
      setIsSyncing(true);
      setShowSuccess(false);
    };

    const handleSyncComplete = (e: Event) => {
      console.log("Sync completed");
      setIsSyncing(false);
      
      // Get timestamp from event if available
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.timestamp) {
        setLastSyncTime(new Date(customEvent.detail.timestamp));
      } else {
        setLastSyncTime(new Date());
      }
      
      // Show success indicator briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger a sync now that we're online
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
    const initialLastSyncTime = getLastSyncTime();
    if (initialLastSyncTime) {
      setLastSyncTime(initialLastSyncTime);
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener(StorageEvents.SYNC_START, handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
  } else if (showSuccess) {
    // Success indicator (briefly shown)
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md animate-in fade-in">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">סנכרון הושלם</span>
      </div>
    );
  } else {
    // Nothing to show when idle
    indicatorToShow = null;
  }

  return indicatorToShow;
};

export default SyncIndicator;
