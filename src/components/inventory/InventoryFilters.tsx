
import { getAllAlbums } from "@/lib/data";
import ViewModeToggle from "../ViewModeToggle";
import AlbumCarousel from "./AlbumCarousel";

interface InventoryFiltersProps {
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
}

const InventoryFilters = ({
  selectedAlbumId,
  onAlbumChange,
  viewMode,
  setViewMode,
  showImages,
  setShowImages
}: InventoryFiltersProps) => {
  const albums = getAllAlbums();

  return (
    <div className="flex flex-col gap-2 py-1">
      <AlbumCarousel 
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={onAlbumChange}
      />
      <div className="flex justify-start">
        <ViewModeToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
        />
      </div>
    </div>
  );
};

export default InventoryFilters;
