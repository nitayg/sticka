
import { Album } from "@/lib/types";
import { Button } from "../ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddStickerForm from "../AddStickerForm";
import ViewModeToggle from "../ViewModeToggle";
import ImportExcelDialog from "../ImportExcelDialog";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import AddAlbumForm from "../AddAlbumForm";

interface AlbumHeaderProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onImportComplete?: () => void;
}

const AlbumHeader = ({ 
  albums, 
  selectedAlbum, 
  viewMode, 
  setViewMode, 
  onRefresh,
  onImportComplete
}: AlbumHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap justify-between items-center gap-2" dir="rtl">
      <h1 className="text-2xl font-bold">אלבום המדבקות</h1>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          רענון
        </Button>
        
        <AddAlbumForm onAlbumAdded={onRefresh} />
        
        <ImportExcelDialog 
          albums={albums} 
          selectedAlbum={selectedAlbum} 
          setSelectedAlbum={() => {}} // This is a no-op because we don't want to change the album
          onImportComplete={onImportComplete}
        />
        
        <AddStickerForm 
          onStickerAdded={onRefresh}
          defaultAlbumId={selectedAlbum}
        />
        
        <div className="mr-2">
          <ViewModeToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;
