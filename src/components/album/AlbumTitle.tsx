
import { Album } from "@/lib/types";

interface AlbumTitleProps {
  selectedAlbumData: Album | undefined;
}

const AlbumTitle = ({ selectedAlbumData }: AlbumTitleProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold truncate">
        {selectedAlbumData ? selectedAlbumData.name : 'טוען...'}
      </h1>
      <p className="text-muted-foreground text-sm">
        {selectedAlbumData?.description || 'בחר אלבום כדי להציג את המדבקות שלו'}
      </p>
    </div>
  );
};

export default AlbumTitle;
