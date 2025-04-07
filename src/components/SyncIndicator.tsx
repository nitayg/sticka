
/**
 * SyncIndicator
 * קומפוננטת UI המציגה אינדיקציה על סנכרון בתהליך
 */
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, CloudOff } from 'lucide-react';
import { StorageEvents, getSyncState } from '@/lib/sync';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncIndicatorProps {
  headerPosition?: boolean;
  className?: string;
}

const SyncIndicator = ({ headerPosition = false, className }: SyncIndicatorProps) => {
  const [syncing, setSyncing] = useState(getSyncState().isInProgress);
  const [animated, setAnimated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    // הפעלת אנימציה כשיש סנכרון בתהליך
    if (syncing) {
      setAnimated(true);
      setShowSuccess(false);
    } else {
      // כשמסתיים סנכרון, מציג אנימציית הצלחה
      if (animated) {
        setShowSuccess(true);
        const successTimeout = setTimeout(() => {
          setShowSuccess(false);
          const animationTimeout = setTimeout(() => {
            setAnimated(false);
          }, 500);
          return () => clearTimeout(animationTimeout);
        }, 1500);
        return () => clearTimeout(successTimeout);
      }
    }
  }, [syncing, animated]);
  
  // אירועי חיבור לרשת
  useEffect(() => {
    const handleOnlineStatus = () => {
      setOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
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
  
  // אם לא נמצאים בהדר, לא נציג את האינדיקטור כלל
  if (!headerPosition) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {(animated || offline) && (
        <motion.div 
          className={cn(
            "flex items-center justify-center h-8 w-8 mx-1",
            className
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {offline ? (
            <CloudOff className="h-4 w-4 text-orange-500" />
          ) : syncing ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : showSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </motion.div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncIndicator;
