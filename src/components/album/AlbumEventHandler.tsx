
import { useEffect } from "react";
import { forceSync } from "@/lib/sync-manager";

interface AlbumEventHandlerProps {
  albums: any[];
  selectedAlbumId: string;
  handleAlbumChange: (albumId: string) => void;
  onRefresh: () => void;
}

const AlbumEventHandler = ({
  albums,
  selectedAlbumId,
  handleAlbumChange,
  onRefresh
}: AlbumEventHandlerProps) => {
  // Set default album if none is selected
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Listen for album data changes
  useEffect(() => {
    const handleAlbumDataChanged = () => {
      onRefresh();
      // Force a sync when album data changes
      forceSync();
    };
    
    window.addEventListener('albumDataChanged', handleAlbumDataChanged);
    
    return () => {
      window.removeEventListener('albumDataChanged', handleAlbumDataChanged);
    };
  }, [onRefresh]);
  
  return null; // This is a hook component and doesn't render anything
};

export default AlbumEventHandler;
