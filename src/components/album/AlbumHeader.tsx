
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
    <div className="pb-2 mb-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <AlbumTitle selectedAlbumData={selectedAlbumData} />
        
        <AlbumHeaderActions
          albums={albums} // Pass the albums prop
          selectedAlbum={selectedAlbum}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};

export default AlbumHeader;
