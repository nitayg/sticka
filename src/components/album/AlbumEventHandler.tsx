
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAlbum, deleteAlbum } from '@/lib/album-operations';
import { Album } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { StorageEvents } from '@/lib/sync';

interface AlbumEventHandlerProps {
  album: Album;
}

const AlbumEventHandler: React.FC<AlbumEventHandlerProps> = ({ album }) => {
  const queryClient = useQueryClient();

  // Mutation for updating an album
  const updateAlbumMutation = useMutation({
    mutationFn: (data: Partial<Album>) => {
      const updatedAlbum = updateAlbum(album.id, data);
      return Promise.resolve(updatedAlbum);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      toast({
        title: "האלבום עודכן בהצלחה!",
      });
    },
    onError: (error) => {
      toast({
        title: "אירעה שגיאה בעדכון האלבום.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting an album
  const deleteAlbumMutation = useMutation({
    mutationFn: () => {
      return deleteAlbum(album.id);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['albums'] });
        queryClient.invalidateQueries({ queryKey: ['stickers'] });
      }
    },
    onError: (error) => {
      toast({
        title: "אירעה שגיאה במחיקת האלבום.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleAlbumsUpdated = (event: any) => {
      // Check if the updated album is the current album
      if (event.detail && event.detail.find((updatedAlbum: Album) => updatedAlbum.id === album.id)) {
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['albums'] });
      }
    };

    const handleAlbumDeleted = (event: any) => {
      if (event.detail && event.detail.albumId === album.id) {
        queryClient.invalidateQueries({ queryKey: ['albums'] });
        queryClient.invalidateQueries({ queryKey: ['stickers'] });
      }
    };

    window.addEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);

    return () => {
      window.removeEventListener(StorageEvents.ALBUMS, handleAlbumsUpdated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
    };
  }, [album.id, queryClient]);

  return null; // This component doesn't render anything
};

export default AlbumEventHandler;
