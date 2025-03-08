
import { Album } from "@/lib/types";

interface AlbumTitleProps {
  selectedAlbumData?: Album;
}

const AlbumTitle = ({ selectedAlbumData }: AlbumTitleProps) => {
  if (!selectedAlbumData) {
    return (
      <div className="py-1">
        <h1 className="text-xl font-bold">אין אלבומים פעילים</h1>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <h1 className="text-xl font-bold">
        {selectedAlbumData.name}
      </h1>
      
      {selectedAlbumData.description && (
        <span className="text-sm text-muted-foreground mx-2 hidden md:inline">
          •
        </span>
      )}
      
      {selectedAlbumData.description && (
        <p className="text-sm text-muted-foreground hidden md:inline">
          {selectedAlbumData.description}
          {selectedAlbumData.description && selectedAlbumData.year ? " | " : ""}
          {selectedAlbumData.year}
        </p>
      )}
    </div>
  );
};

export default AlbumTitle;
