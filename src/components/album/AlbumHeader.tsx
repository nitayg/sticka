
import { Album } from "@/lib/types";
import AlbumTitle from "./AlbumTitle";
import AlbumHeaderActions from "./AlbumHeaderActions";
import AlbumSearch from "./AlbumSearch";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
  onSearch: (query: string) => void;
}

const AlbumHeader = ({
  albums,
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  onImportComplete,
  onSearch
}: AlbumHeaderProps) => {
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);
  
  return (
    <div className="pb-2 mb-1">
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center">
          <AlbumTitle selectedAlbumData={selectedAlbumData} />
          <AlbumSearch onSearch={onSearch} className="mr-2" />
        </div>
        
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
