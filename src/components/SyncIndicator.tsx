
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { isSyncInProgress, getLastSyncTime, StorageEvents } from '@/lib/sync';

const SyncIndicator = () => {
  const [syncing, setSyncing] = useState(isSyncInProgress());
  
  useEffect(() => {
    const handleSyncStart = () => {
      setSyncing(true);
    };
    
    const handleSyncComplete = () => {
      setSyncing(false);
    };
    
    window.addEventListener(StorageEvents.SYNC_START, handleSyncStart);
    window.addEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    
    return () => {
      window.removeEventListener(StorageEvents.SYNC_START, handleSyncStart);
      window.removeEventListener(StorageEvents.SYNC_COMPLETE, handleSyncComplete);
    };
  }, []);
  
  if (!syncing) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-center h-9 w-9 mr-1">
      <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
    </div>
  );
};

export default SyncIndicator;
