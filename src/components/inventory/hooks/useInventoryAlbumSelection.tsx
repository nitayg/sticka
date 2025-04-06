
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAlbums } from "@/lib/album-operations";

interface UseInventoryAlbumSelectionProps {
  selectedAlbumId: string;
  handleAlbumChange: (albumId: string) => void;
}

/**
 * Custom hook to handle album selection and persistence
 */
export const useInventoryAlbumSelection = ({
  selectedAlbumId,
  handleAlbumChange
}: UseInventoryAlbumSelectionProps) => {
  // Fetch all albums
  const { data: albums = [], isLoading: isAlbumsLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums
  });
  
  // Initialize album selection from localStorage or use first album
  useEffect(() => {
    if (albums && albums.length > 0 && !selectedAlbumId) {
      // Try to get last selected album from localStorage
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        handleAlbumChange(lastSelectedAlbum);
      } else {
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Store selected album ID when it changes
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
  return {
    albums,
    isAlbumsLoading
  };
};
