
import { Album } from "@/lib/types";

interface AlbumTitleProps {
  selectedAlbumData?: Album;
}

const AlbumTitle = ({ selectedAlbumData }: AlbumTitleProps) => {
  if (!selectedAlbumData) {
    return (
      <div className="flex justify-center py-4">
        <h1 className="text-xl font-bold">אין אלבומים פעילים</h1>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-center py-2">
      <h1 className="text-xl font-bold text-center">
        {selectedAlbumData.name}
      </h1>
      
      {(selectedAlbumData.releaseYear || selectedAlbumData.publisher) && (
        <span className="text-sm text-muted-foreground mx-2 hidden md:inline">
          •
        </span>
      )}
      
      {(selectedAlbumData.releaseYear || selectedAlbumData.publisher) && (
        <p className="text-sm text-muted-foreground text-center md:text-right">
          {selectedAlbumData.publisher}
          {selectedAlbumData.publisher && selectedAlbumData.releaseYear ? " | " : ""}
          {selectedAlbumData.releaseYear}
        </p>
      )}
    </div>
  );
};

export default AlbumTitle;
