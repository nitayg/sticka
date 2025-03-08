
import { Album } from "@/lib/types";
import AlbumTitle from "./AlbumTitle";
import AlbumHeaderActions from "./AlbumHeaderActions";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
}

const AlbumHeader = ({
  albums,
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  onImportComplete
}: AlbumHeaderProps) => {
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);
  
  return (
    <div className="py-2 mb-1">
      <div className="flex items-center justify-between">
        <AlbumTitle selectedAlbumData={selectedAlbumData} />
        
        <AlbumHeaderActions
          albums={albums}
          selectedAlbum={selectedAlbum}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
          onRefresh={onRefresh}
          onImportComplete={onImportComplete}
        />
      </div>
    </div>
  );
};

export default AlbumHeader;
