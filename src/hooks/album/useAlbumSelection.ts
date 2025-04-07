
import { useEffect } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import { Album } from "@/lib/types";

export const useAlbumSelection = (albums: Album[]) => {
  const { selectedAlbumId, handleAlbumChange } = useAlbumStore();
  
  // Enhanced error handling when selecting album
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      console.log("[useAlbumSelection] Last selected album:", lastSelectedAlbum);
      
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        console.log("[useAlbumSelection] Restoring previous album selection:", lastSelectedAlbum);
        handleAlbumChange(lastSelectedAlbum);
      } else {
        console.log("[useAlbumSelection] Selecting first album:", albums[0].id);
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Persist album selection to localStorage
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
  return { selectedAlbumId, handleAlbumChange };
};
