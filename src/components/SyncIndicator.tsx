import { useState, useEffect } from "react";
import { Loader2, CheckCircle, WifiOff, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StorageEvents, isSyncInProgress, getLastSyncTime, forceSync, isOnline } from "@/lib/sync/index";

const SyncIndicator = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for sync events
    const handleSyncStart = () => {
      console.log("[SyncIndicator] Sync started");
      setIsSyncing(true);
      setShowSuccess(false);
      setHasError(false);
    };

    const handleSyncComplete = (e: Event) => {
      console.log("[SyncIndicator] Sync completed");
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
      
      toast({
        title: "סנכרון הושלם",
        description: "הנתונים עודכנו בהצלחה",
        duration: 3000,
      });
    };
    
    // Listen for connection status changes
    const handleOnline = () => {
      setOnlineStatus(true);
      toast({
        title: "התחברת לרשת",
        description: "הסנכרון יתחדש באופן אוטומטי",
        duration: 3000,
      });
      // Trigger a sync now that we're online
      forceSync();
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
      toast({
        title: "אין חיבור לרשת",
        description: "שינויים יסתנכרנו כשהחיבור יחזור",
        variant: "destructive",
        duration: 5000,
      });
    };

    // Handle connection status change event
    const handleConnectionStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setOnlineStatus(customEvent.detail.isOnline);
      }
    };

    // Register event listeners
    window.addEventListener(StorageEvents.SYNC_START, handleSyncStart);
    window.addEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-status-changed', handleConnectionStatus);

    // Initialize state from sync manager
    setIsSyncing(isSyncInProgress());
    setOnlineStatus(isOnline());
    const initialLastSyncTime = getLastSyncTime();
    if (initialLastSyncTime) {
      setLastSyncTime(initialLastSyncTime);
    }

    // Trigger an initial sync when component mounts
    const initialSyncTimeout = setTimeout(() => {
      if (!isSyncInProgress() && navigator.onLine) {
        forceSync().catch(err => {
          console.error("[SyncIndicator] Error during initial sync:", err);
          setHasError(true);
          toast({
            title: "שגיאת סנכרון",
            description: "אירעה שגיאה בעת ניסיון לסנכרן את הנתונים",
            variant: "destructive",
            duration: 5000,
          });
        });
      }
    }, 1000);

    return () => {
      // Clean up event listeners
      window.removeEventListener(StorageEvents.SYNC_START, handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-status-changed', handleConnectionStatus);
      clearTimeout(initialSyncTimeout);
    };
  }, []);

  // Manual sync handler
  const handleManualSync = () => {
    if (!isSyncing && onlineStatus) {
      forceSync().catch(err => {
        console.error("[SyncIndicator] Error during manual sync:", err);
        setHasError(true);
        toast({
          title: "שגיאת סנכרון",
          description: "אירעה שגיאה בעת ניסיון לסנכרן את הנתונים",
          variant: "destructive",
          duration: 5000,
        });
      });
    }
  };

  // Determine what to show
  let indicatorToShow;
  
  if (!onlineStatus) {
    // Offline indicator
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md">
        <WifiOff className="h-4 w-4 ml-1" />
        <span className="text-sm">אין חיבור</span>
      </div>
    );
  } else if (isSyncing) {
    // Syncing indicator
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-interactive text-interactive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md animate-in fade-in">
        <Loader2 className="animate-spin h-4 w-4 ml-1" />
        <span className="text-sm">מסנכרן...</span>
      </div>
    );
  } else if (showSuccess) {
    // Success indicator (briefly shown)
    indicatorToShow = (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md animate-in fade-in">
        <CheckCircle className="h-4 w-4 ml-1" />
        <span className="text-sm">סנכרון הושלם</span>
      </div>
    );
  } else if (hasError) {
    // Error indicator
    indicatorToShow = (
      <div 
        className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md cursor-pointer"
        onClick={handleManualSync}
      >
        <RefreshCcw className="h-4 w-4 ml-1" />
        <span className="text-sm">נסה שוב</span>
      </div>
    );
  } else {
    // Manual sync button when idle
    indicatorToShow = (
      <div 
        className="fixed bottom-4 left-4 bg-muted text-muted-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={handleManualSync}
      >
        <RefreshCcw className="h-4 w-4 ml-1" />
        <span className="text-sm">סנכרון</span>
      </div>
    );
  }

  return indicatorToShow;
};

export default SyncIndicator;
