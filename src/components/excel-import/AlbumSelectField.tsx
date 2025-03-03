
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Album } from "@/lib/types";

interface AlbumSelectFieldProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
}

const AlbumSelectField = ({ albums, selectedAlbum, setSelectedAlbum }: AlbumSelectFieldProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="album" className="text-right">בחר אלבום</Label>
      <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="בחר אלבום" />
        </SelectTrigger>
        <SelectContent>
          {albums.map(album => (
            <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AlbumSelectField;
