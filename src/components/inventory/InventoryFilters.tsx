import React from "react";
import { Album } from "@/lib/types";
import AlbumCarousel from "./AlbumCarousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface InventoryFiltersProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  showMissing: boolean;
  setShowMissing: (show: boolean) => void;
  showDuplicated: boolean;
  setShowDuplicated: (show: boolean) => void;
}

const InventoryFilters = ({
  albums,
  selectedAlbumId,
  onAlbumChange,
  searchValue,
  setSearchValue,
  showCompleted,
  setShowCompleted,
  showMissing,
  setShowMissing,
  showDuplicated,
  setShowDuplicated,
}: InventoryFiltersProps) => {
  return (
    <div className="space-y-4 mb-4 py-1">
      <AlbumCarousel 
        albums={albums} 
        selectedAlbumId={selectedAlbumId} 
        onAlbumChange={onAlbumChange}
        onAlbumEdit={() => {}} // Providing empty function to satisfy the prop requirement
      />
      
      <Input
        type="search"
        placeholder="חיפוש..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Switch
          id="completed"
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
        />
        <Label htmlFor="completed">הושלמו</Label>
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Switch
          id="missing"
          checked={showMissing}
          onCheckedChange={setShowMissing}
        />
        <Label htmlFor="missing">חסרים</Label>
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Switch
          id="duplicated"
          checked={showDuplicated}
          onCheckedChange={setShowDuplicated}
        />
        <Label htmlFor="duplicated">כפולים</Label>
      </div>
    </div>
  );
};

export default InventoryFilters;
