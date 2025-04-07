
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAlbums } from "@/lib/album-operations";
import { Album } from "@/lib/types";

interface AlbumSelectorProps {
  albumId: string;
  setAlbumId: (id: string) => void;
}

const AlbumSelector = ({ albumId, setAlbumId }: AlbumSelectorProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  
  useEffect(() => {
    const loadAlbums = async () => {
      const albumData = await getAlbums();
      setAlbums(albumData);
      
      // Auto-select the first album if none is selected
      if (!albumId && albumData.length > 0) {
        setAlbumId(albumData[0].id);
      }
    };
    
    loadAlbums();
    
    // Add listener for album data changes
    const handleAlbumDataChanged = () => {
      loadAlbums();
    };
    
    window.addEventListener('albumDataChanged', handleAlbumDataChanged);
    
    return () => {
      window.removeEventListener('albumDataChanged', handleAlbumDataChanged);
    };
  }, [albumId, setAlbumId]);
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="album" className="text-right">
        אלבום *
      </Label>
      <Select 
        value={albumId} 
        onValueChange={setAlbumId}
      >
        <SelectTrigger id="album" className="col-span-3">
          <SelectValue placeholder="בחר אלבום" />
        </SelectTrigger>
        <SelectContent>
          {albums.map(album => (
            <SelectItem key={album.id} value={album.id}>
              {album.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlbumSelector;
