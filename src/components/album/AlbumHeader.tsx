
import Header from "../Header";
import AddStickerForm from "../AddStickerForm";
import AddAlbumForm from "../AddAlbumForm";
import ViewModeToggle from "../ViewModeToggle";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onRefresh: () => void;
}

const AlbumHeader = ({
  albums,
  selectedAlbum,
  viewMode,
  setViewMode,
  onRefresh,
}: AlbumHeaderProps) => {
  return (
    <Header 
      title="אלבום דיגיטלי" 
      subtitle="צפייה וארגון אוסף המדבקות שלך"
      action={
        <div className="flex gap-2 flex-wrap justify-end">
          <ImportExcelDialog 
            albums={albums}
            selectedAlbum={selectedAlbum}
            setSelectedAlbum={() => {}}
          />
          
          <AddAlbumForm onAlbumAdded={onRefresh} />
          
          <ViewModeToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
          
          <AddStickerForm 
            onStickerAdded={onRefresh} 
            defaultAlbumId={selectedAlbum}
          />
        </div>
      }
    />
  );
};

export default AlbumHeader;
