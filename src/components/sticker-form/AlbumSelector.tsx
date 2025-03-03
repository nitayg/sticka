
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAllAlbums } from "@/lib/data";

interface AlbumSelectorProps {
  albumId: string;
  setAlbumId: (value: string) => void;
}

const AlbumSelector = ({ albumId, setAlbumId }: AlbumSelectorProps) => {
  const albums = getAllAlbums();
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="albumId" className="text-right">
        אלבום *
      </Label>
      <Select
        value={albumId}
        onValueChange={setAlbumId}
        required
      >
        <SelectTrigger className="col-span-3">
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

export default AlbumSelector;
