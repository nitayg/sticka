
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AlbumHeaderActionsProps {
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  albums: Album[];
  onImportComplete: () => void;
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
  const { toast } = useToast();
  
  // Action buttons - simplified version without refresh and recycle
  const actionButtons = (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AddAlbumForm onAlbumAdded={onRefresh} iconOnly />
          </TooltipTrigger>
          <TooltipContent>
            הוסף אלבום
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <ImportExcelDialog 
              albums={albums} 
              selectedAlbum={selectedAlbum} 
              setSelectedAlbum={() => {}} 
              onImportComplete={onImportComplete}
              iconOnly
            />
          </TooltipTrigger>
          <TooltipContent>
            יבא מאקסל
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  return (
    <div className="flex gap-2 items-center">
      <ViewModeToggle 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      {actionButtons}
    </div>
  );
};

export default AlbumHeaderActions;
