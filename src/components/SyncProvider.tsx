
/**
 * SyncProvider
 * קומפוננטה אחראית על אתחול מערכת הסנכרון והפצת אירועים
 */
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { initializeSync, StorageEvents, setAlbumData, setStickerData } from '@/lib/sync';

interface SyncProviderProps {
  children: React.ReactNode;
  notifications?: boolean;
}

const SyncProvider = ({ children, notifications = false }: SyncProviderProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // אתחול מערכת הסנכרון
    const initSync = async () => {
      await initializeSync();
      
      if (notifications) {
        toast({
          title: "סנכרון מוכן",
          description: "נתונים יסונכרנו בין מכשירים ובין לשוניות באופן אוטומטי",
        });
      }
    };
    
    initSync();

    // מאזינים לאירועי סנכרון
    const handleAlbumsUpdated = (event: any) => {
      if (event.detail) {
        setAlbumData(event.detail);
        console.log('Albums updated from sync');
      }
    };

    const handleStickersUpdated = (event: any) => {
      if (event.detail) {
        setStickerData(event.detail);
        console.log('Stickers updated from sync');
      }
    };

    // רישום למאזינים
    window.addEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
    window.addEventListener(StorageEvents.STICKERS, handleStickersUpdated);

    // ניקוי מאזינים
    return () => {
      window.removeEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
      window.removeEventListener(StorageEvents.STICKERS, handleStickersUpdated);
    };
  }, [toast, notifications]);

  return <>{children}</>;
};

export default SyncProvider;
