
import React, { useState, useEffect } from "react";
import { Album } from "@/lib/types";
import AlbumCarouselGrid from "../album/AlbumCarouselGrid";
import EditAlbumForm from "../add-album-form";
import { useAlbumOrderStore } from "@/store/useAlbumOrderStore";

interface AlbumCarouselProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  onAlbumEdit: () => void;
}

const AlbumCarousel = ({ 
  albums,
  selectedAlbumId,
  onAlbumChange,
  onAlbumEdit
}: AlbumCarouselProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<string | null>(null);
  const { initializeOrder } = useAlbumOrderStore();
  
  // Initialize album order when albums change
  useEffect(() => {
    initializeOrder();
  }, [albums, initializeOrder]);
  
  const handleEditAlbum = (albumId: string) => {
    setAlbumToEdit(albumId);
    setShowEditForm(true);
  };
  
  const handleSaveAlbum = () => {
    setShowEditForm(false);
    setAlbumToEdit(null);
    onAlbumEdit();
  };

  return (
    <div className="w-full mb-4 relative">
      <AlbumCarouselGrid
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={onAlbumChange}
        onEdit={handleEditAlbum}
      />
      
      {showEditForm && albumToEdit && (
        <EditAlbumForm
          albumId={albumToEdit}
          onAlbumAdded={handleSaveAlbum}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default AlbumCarousel;
