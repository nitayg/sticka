
import { useState } from "react";
import AlbumCarouselGrid from "./AlbumCarouselGrid";
import AlbumEditDialog from "./management/AlbumEditDialog";
import AlbumDeleteDialog from "./management/AlbumDeleteDialog";
import { Album } from "@/lib/types";

interface AlbumControlsProps {
  albums: Album[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
  onTeamsManage: () => void;
}

const AlbumControls = ({ 
  albums, 
  selectedAlbum, 
  handleAlbumChange,
  onTeamsManage 
}: AlbumControlsProps) => {
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  const handleAlbumEdit = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album) {
      setEditingAlbum(album);
    }
  };

  const handleAlbumDelete = (albumId: string) => {
    setAlbumToDelete(albumId);
  };

  const handleAlbumDeleted = (deletedAlbumId: string) => {
    // Select another album if the deleted one was selected
    if (deletedAlbumId === selectedAlbum && albums.length > 1) {
      const otherAlbum = albums.find(a => a.id !== deletedAlbumId);
      if (otherAlbum) {
        handleAlbumChange(otherAlbum.id);
      }
    }
  };

  return (
    <div>
      <AlbumCarouselGrid 
        albums={albums}
        selectedAlbumId={selectedAlbum}
        onAlbumChange={handleAlbumChange}
        onEdit={handleAlbumEdit}
        onDelete={handleAlbumDelete}
      />

      {/* Album Edit Dialog */}
      <AlbumEditDialog 
        album={editingAlbum} 
        onClose={() => setEditingAlbum(null)} 
      />

      {/* Delete Confirmation Dialog */}
      <AlbumDeleteDialog 
        albumId={albumToDelete}
        albumName={albums.find(a => a.id === albumToDelete)?.name}
        onClose={() => setAlbumToDelete(null)}
        onAlbumDeleted={handleAlbumDeleted}
      />
    </div>
  );
};

export default AlbumControls;
