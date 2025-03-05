
import React from "react";
import { Download, UploadIcon } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";

interface AlbumHeaderActionsProps {
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
}

const AlbumHeaderActions = ({
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh
}: AlbumHeaderActionsProps) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <AddAlbumForm onAlbumAdded={onRefresh} />
      
      <ImportExcelDialog onImportComplete={onRefresh} />
      
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
