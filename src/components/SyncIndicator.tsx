
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { isSyncInProgress, getLastSyncTime, StorageEvents } from '@/lib/sync';

interface SyncIndicatorProps {
  headerPosition?: boolean;
}

const SyncIndicator = ({ headerPosition = false }: SyncIndicatorProps) => {
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
  
  if (headerPosition) {
    return (
      <div className="flex items-center justify-center h-8 w-8 mx-1">
        <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="hidden">
      <Loader2 className="animate-spin h-4 w-4 text-white" />
    </div>
  );
};

export default SyncIndicator;
