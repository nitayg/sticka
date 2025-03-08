
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
    <div className="fixed top-16 left-4 p-2 flex items-center justify-center rounded-full bg-blue-500 h-8 w-8 z-50">
      <Loader2 className="animate-spin h-4 w-4 text-white" />
    </div>
  );
};

export default SyncIndicator;
