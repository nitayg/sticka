
import React from "react";
import { Album } from "@/lib/types";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
}

const AlbumHeader = ({ 
  albums,
  selectedAlbum
}: AlbumHeaderProps) => {
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);
  
  if (!selectedAlbumData) return null;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-semibold">{selectedAlbumData.name}</h2>
      </div>
    </div>
  );
};

export default AlbumHeader;
