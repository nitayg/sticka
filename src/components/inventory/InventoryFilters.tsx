
import { useState } from "react";
import { getAllAlbums } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import ViewModeToggle from "../ViewModeToggle";

interface InventoryFiltersProps {
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
}

const InventoryFilters = ({
  selectedAlbumId,
  onAlbumChange,
  viewMode,
  setViewMode,
  showImages,
  setShowImages
}: InventoryFiltersProps) => {
  const albums = getAllAlbums();

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 pb-1">
      <div className="w-48">
        <Select
          value={selectedAlbumId}
          onValueChange={onAlbumChange}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="בחר אלבום" />
          </SelectTrigger>
          <SelectContent>
            {albums.map(album => (
              <SelectItem key={album.id} value={album.id}>
                {album.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ViewModeToggle 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
    </div>
  );
};

export default InventoryFilters;
