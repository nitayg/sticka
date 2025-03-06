
import React from "react";
import { Download, UploadIcon } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";

interface AlbumHeaderActionsProps {
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  albums: Album[]; // Add albums prop
  onImportComplete: () => void; // Add onImportComplete prop
}

const AlbumHeaderActions = ({
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  albums,
  onImportComplete
}: AlbumHeaderActionsProps) => {
  return (
    <div className="flex items-center justify-end space-x-2">
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
    </div>
  );
};

export default AlbumHeaderActions;
