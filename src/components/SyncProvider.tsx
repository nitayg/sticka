
/**
 * SyncProvider
 * קומפוננטה אחראית על אתחול מערכת הסנכרון והפצת אירועים
 */
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { initializeSync, StorageEvents, setAlbumData, setStickerData } from '@/lib/sync';

interface SyncProviderProps {
  children: React.ReactNode;
  notifications?: boolean;
}

const SyncProvider = ({ children, notifications = false }: SyncProviderProps) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitializing = useRef(false);

  // Limit the frequency of data change events
  const useThrottledEventListener = (eventName: string, handler: (event: any) => void) => {
    useEffect(() => {
      let lastHandleTime = 0;
      const throttleTime = 1000; // 1 second
      
      const throttledHandler = (event: any) => {
        const now = Date.now();
        if (now - lastHandleTime >= throttleTime) {
          lastHandleTime = now;
          handler(event);
        }
      };
      
      window.addEventListener(eventName, throttledHandler);
      return () => window.removeEventListener(eventName, throttledHandler);
    }, [eventName, handler]);
  };

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitialized || isInitializing.current) return;
    
    // אתחול מערכת הסנכרון
    const initSync = async () => {
      isInitializing.current = true;
      try {
        await initializeSync();
        setIsInitialized(true);
        
        if (notifications) {
          toast({
            title: "סנכרון מוכן",
            description: "נתונים יסונכרנו בין מכשירים ובין לשוניות באופן אוטומטי",
          });
        }
      } catch (error) {
        console.error("Error initializing sync:", error);
      } finally {
        isInitializing.current = false;
      }
    };
    
    initSync();
  }, [toast, notifications]);

  // Throttled event handlers to prevent too frequent updates
  useThrottledEventListener(StorageEvents.ALBUMS, (event) => {
    if (event.detail) {
      setAlbumData(event.detail);
      console.log('Albums updated from sync');
    }
  });

  useThrottledEventListener(StorageEvents.STICKERS, (event) => {
    if (event.detail) {
      setStickerData(event.detail);
      console.log('Stickers updated from sync');
    }
  });

  return <>{children}</>;
};

export default SyncProvider;
