
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAllAlbums } from "@/lib/data";

interface BasicStickerInfoProps {
  number: string;
  setNumber: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  team: string;
  setTeam: (value: string) => void;
  originalTeam: string;
  albumId: string;
  setAlbumId: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const BasicStickerInfo = ({
  number,
  setNumber,
  name,
  setName,
  team,
  setTeam,
  originalTeam,
  albumId,
  setAlbumId,
  category,
  setCategory
}: BasicStickerInfoProps) => {
  const albums = getAllAlbums();
  const categories = ["שחקנים", "קבוצות", "אצטדיונים", "סמלים", "אחר"];

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="albumId" className="text-right">אלבום *</Label>
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
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="number" className="text-right">מספר *</Label>
        <Input
          id="number"
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">שם *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="team" className="text-right">קבוצה/סדרה *</Label>
        <Input
          id="team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      {team !== originalTeam && (
        <div className="grid grid-cols-4 items-center gap-4">
          <div></div>
          <div className="col-span-3">
            <div className="text-sm text-muted-foreground">
              שים לב: שינוי שם הקבוצה יעדכן את כל המדבקות של קבוצה זו באלבום
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">קטגוריה</Label>
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="בחר קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BasicStickerInfo;
