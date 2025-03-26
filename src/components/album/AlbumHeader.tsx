import React from "react";
import { Album } from "@/lib/types";

type ViewMode = "grid" | "list"; // אני מגדיר את הטייפ הזה כאן כי הוא לא מוגדר בקבצים ששלחת

interface AlbumHeaderProps {
  albums: Album[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
}

const AlbumHeader = ({ 
  albums,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh
}: AlbumHeaderProps) => {
  const selectedAlbum = albums[0]; // מאחר שאתה מעביר מערך עם אלבום אחד, אני לוקח את הראשון
  
  if (!selectedAlbum) return null;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-semibold">{selectedAlbum.name}</h2>
      </div>
    </div>
  );
};

export default AlbumHeader;
