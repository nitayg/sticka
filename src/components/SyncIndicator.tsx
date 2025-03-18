
/**
 * SyncIndicator
 * קומפוננטת UI המציגה אינדיקציה על סנכרון בתהליך
 */
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { StorageEvents, getSyncState } from '@/lib/sync';
import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
  headerPosition?: boolean;
  className?: string;
}

const SyncIndicator = ({ headerPosition = false, className }: SyncIndicatorProps) => {
  const [syncing, setSyncing] = useState(getSyncState().isInProgress);
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    // הפעלת אנימציה כשיש סנכרון בתהליך
    if (syncing) {
      setAnimated(true);
    }
    
    // כיבוי אנימציה אחרי השהייה
    const animationTimeout = syncing ? null : setTimeout(() => {
      setAnimated(false);
    }, 1000);
    
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [syncing]);
  
  useEffect(() => {
    // מאזינים לאירועי סנכרון
    const handleSyncStart = () => {
      setSyncing(true);
    };
    
    const handleSyncComplete = () => {
      setSyncing(false);
    };
    
    const handleSyncError = () => {
      setSyncing(false);
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
  
  // אם אין סנכרון ואין אנימציה פעילה, לא מציגים כלום
  if (!syncing && !animated) {
    return null;
  }
  
  // אם לא נמצאים בהדר, לא נציג את האינדיקטור כלל
  if (!headerPosition) {
    return null;
  }
  
  return (
    <div className={cn(
      "flex items-center justify-center h-8 w-8 mx-1 transition-opacity",
      animated ? "opacity-100" : "opacity-0",
      className
    )}>
      <Loader2 className={cn(
        "h-4 w-4 text-blue-500 transition-all",
        animated ? "animate-spin" : ""
      )} />
    </div>
  );
};

export default SyncIndicator;
