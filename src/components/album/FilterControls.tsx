
import React from "react";
import { Album } from "@/lib/types";
import AlbumSelector from "../AlbumSelector";

export interface FilterControlsProps {
  albums: Album[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  albums,
  selectedAlbum,
  handleAlbumChange,
}) => {
  return (
    <div className="mb-4">
      <AlbumSelector
        albums={albums}
        selectedAlbumId={selectedAlbum}
        onAlbumChange={handleAlbumChange}
      />
    </div>
  );
};

export default FilterControls;
