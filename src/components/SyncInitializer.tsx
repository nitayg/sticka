import { useEffect } from 'react';
import { StorageEvents } from '@/lib/sync';
import { setAlbumData } from '@/lib/album-operations';
import { setStickerData } from '@/lib/sticker-operations';
import { useToast } from './ui/use-toast';

// This component is being replaced by SyncProvider, but we're keeping it for backward compatibility
// We'll only listen to events here, not initialize storage
const SyncInitializer = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for albums updated
    const handleAlbumsUpdated = (event: any) => {
      if (event.detail) {
        setAlbumData(event.detail);
        console.log('Albums updated from another tab/window');
      }
    };

    // Listen for stickers updated
    const handleStickersUpdated = (event: any) => {
      if (event.detail) {
        setStickerData(event.detail);
        console.log('Stickers updated from another tab/window');
      }
    };

    // Add event listeners
    window.addEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
    window.addEventListener(StorageEvents.STICKERS, handleStickersUpdated);

    // Show sync ready toast
    toast({
      title: "סנכרון מוכן",
      description: "נתונים יסונכרנו בין לשוניות ובין הפעלות מחדש",
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
      window.removeEventListener(StorageEvents.STICKERS, handleStickersUpdated);
    };
  }, [toast]);

  return null; // This component doesn't render anything
};

export default SyncInitializer;
