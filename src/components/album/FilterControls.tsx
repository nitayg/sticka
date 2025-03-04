
import { Album } from "@/lib/types";
import AlbumCarousel from "../inventory/AlbumCarousel";

interface FilterControlsProps {
  albums: Album[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
  onTeamsManage?: () => void;
}

const FilterControls = ({
  albums,
  selectedAlbum,
  handleAlbumChange,
  onTeamsManage,
}: FilterControlsProps) => {
  return (
    <div>
      <AlbumCarousel 
        albums={albums}
        selectedAlbumId={selectedAlbum}
        onAlbumChange={handleAlbumChange}
      />
    </div>
  );
};

export default FilterControls;
