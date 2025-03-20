
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Album } from "@/lib/types";

interface AlbumSelectFieldProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (value: string) => void;
}

const AlbumSelectField = ({ albums, selectedAlbum, setSelectedAlbum }: AlbumSelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="album" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        אלבום
      </Label>
      <Select
        value={selectedAlbum}
        onValueChange={setSelectedAlbum}
      >
        <SelectTrigger id="album" className="w-full">
          <SelectValue placeholder="בחר אלבום" />
        </SelectTrigger>
        <SelectContent>
          {albums.map((album) => (
            <SelectItem key={album.id} value={album.id}>
              {album.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlbumSelectField;
