
import React from "react";
import { Album } from "lucide-react";
import EmptyState from "../../EmptyState";
import AddAlbumForm from "../../add-album-form";

interface AlbumEmptyStateProps {
  onAlbumAdded: () => void;
}

const AlbumEmptyState = ({ onAlbumAdded }: AlbumEmptyStateProps) => {
  return (
    <div className="space-y-4 animate-fade-in p-4">
      <EmptyState
        icon={<Album className="h-12 w-12" />}
        title="אין אלבומים פעילים"
        description="הוסף אלבום חדש כדי להתחיל"
        action={
          <AddAlbumForm onAlbumAdded={onAlbumAdded} />
        }
      />
    </div>
  );
};

export default AlbumEmptyState;
