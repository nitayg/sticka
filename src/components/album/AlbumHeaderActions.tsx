
import React, { useState } from "react";
import { Download, UploadIcon, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";
import DeleteAlbumDialog from "./DeleteAlbumDialog";
import RecycleBinDialog from "./RecycleBinDialog";

interface AlbumHeaderActionsProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
}

const AlbumHeaderActions = ({
  albums,
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  onImportComplete
}: AlbumHeaderActionsProps) => {
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  
  // מקבל את פרטי האלבום הנבחר
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);

  const handleDeleteClick = () => {
    if (selectedAlbumData) {
      setAlbumToDelete(selectedAlbumData);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <RecycleBinDialog onAction={onRefresh} />
      
      {selectedAlbum && (
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-destructive"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
          מחק אלבום
        </Button>
      )}
      
      <AddAlbumForm onAlbumAdded={onRefresh} />
      
      <ImportExcelDialog 
        albums={albums} 
        selectedAlbum={selectedAlbum} 
        setSelectedAlbum={() => {}} // This is a placeholder since we don't need to change albums from here
        onImportComplete={onImportComplete} 
      />
      
      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      
      {/* דיאלוג אישור מחיקת אלבום */}
      {albumToDelete && (
        <DeleteAlbumDialog
          album={albumToDelete}
          onClose={() => setAlbumToDelete(null)}
          onConfirm={onRefresh}
          mode="recycle"
        />
      )}
    </div>
  );
};

export default AlbumHeaderActions;
