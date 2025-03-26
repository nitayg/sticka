
import React from "react";
import { Album } from "@/lib/types";

// Define the type properly
export type ViewMode = "grid" | "list" | "compact";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbumId?: string;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  showImages?: boolean;
  setShowImages?: (show: boolean) => void;
  onRefresh: () => void;
}

const AlbumHeader = ({ 
  albums,
  selectedAlbumId,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh
}: AlbumHeaderProps) => {
  const selectedAlbum = selectedAlbumId 
    ? albums.find(album => album.id === selectedAlbumId) 
    : (albums && albums.length > 0 ? albums[0] : null);
  
  if (!selectedAlbum) return null;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-semibold">{selectedAlbum.name}</h2>
      </div>
    </div>
  );
};

export default AlbumHeader;
