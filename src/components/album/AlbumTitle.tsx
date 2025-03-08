
import { Album } from "@/lib/types";

interface AlbumTitleProps {
  selectedAlbumData?: Album;
}

const AlbumTitle = ({ selectedAlbumData }: AlbumTitleProps) => {
  if (!selectedAlbumData) {
    return (
      <div className="flex justify-start">
        <h1 className="text-xl font-bold">אין אלבומים פעילים</h1>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <h1 className="text-xl font-bold">
        {selectedAlbumData.name}
      </h1>
      
      {(selectedAlbumData.year || selectedAlbumData.description) && (
        <span className="text-sm text-muted-foreground mx-2 hidden md:inline">
          •
        </span>
      )}
      
      {(selectedAlbumData.year || selectedAlbumData.description) && (
        <p className="text-sm text-muted-foreground hidden md:block">
          {selectedAlbumData.description}
          {selectedAlbumData.description && selectedAlbumData.year ? " | " : ""}
          {selectedAlbumData.year}
        </p>
      )}
    </div>
  );
};

export default AlbumTitle;
