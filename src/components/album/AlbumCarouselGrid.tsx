
import React from "react";
import { Album } from "@/lib/types";
import AlbumGridItem from "./AlbumGridItem";

interface AlbumCarouselGridProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  onEdit: (albumId: string) => void;
  onDelete: (albumId: string) => void;
}

const AlbumCarouselGrid = ({ 
  albums, 
  selectedAlbumId, 
  onAlbumChange,
  onEdit,
  onDelete
}: AlbumCarouselGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
      {albums.map((album) => (
        <div key={album.id} className="aspect-square">
          <AlbumGridItem
            id={album.id}
            name={album.name}
            coverImage={album.coverImage}
            isSelected={album.id === selectedAlbumId}
            onSelect={() => onAlbumChange(album.id)}
            onEdit={() => onEdit(album.id)}
            onDelete={() => onDelete(album.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default AlbumCarouselGrid;
