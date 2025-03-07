
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "./ui/use-toast";
import { StorageEvents } from "@/lib/sync-manager";

const SyncIndicator = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Listen for sync events
    const handleSyncStart = () => {
      console.log("Sync started");
      setIsSyncing(true);
    };

    const handleSyncComplete = () => {
      console.log("Sync completed");
      setIsSyncing(false);
      setLastSyncTime(new Date());
      toast({
        title: "סנכרון הושלם",
        description: "הנתונים עודכנו בהצלחה",
        duration: 3000,
      });
    };

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);

    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    };
  }, []);

  if (!isSyncing) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-interactive text-interactive-foreground px-3 py-2 rounded-full flex items-center space-x-2 z-50 shadow-md">
      <Loader2 className="animate-spin h-4 w-4" />
      <span className="text-sm">מסנכרן...</span>
    </div>
  );
};

export default SyncIndicator;
