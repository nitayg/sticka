
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAllAlbums } from "@/lib/data";

interface FormFieldsProps {
  name: string;
  setName: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  team: string;
  setTeam: (value: string) => void;
  teamLogo: string;
  setTeamLogo: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  albumId: string;
  setAlbumId: (value: string) => void;
  isOwned: boolean;
  setIsOwned: (value: boolean) => void;
  isDuplicate: boolean;
  setIsDuplicate: (value: boolean) => void;
}

const FormFields = ({
  name,
  setName,
  number,
  setNumber,
  team,
  setTeam,
  teamLogo,
  setTeamLogo,
  category,
  setCategory,
  albumId,
  setAlbumId,
  isOwned,
  setIsOwned,
  isDuplicate,
  setIsDuplicate
}: FormFieldsProps) => {
  const albums = getAllAlbums();
  const categories = ["שחקנים", "קבוצות", "אצטדיונים", "סמלים", "אחר"];

  return (
    <>
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
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="number" className="text-right">
          מספר *
        </Label>
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
        <Label htmlFor="name" className="text-right">
          שם *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="team" className="text-right">
          קבוצה/סדרה *
        </Label>
        <Input
          id="team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="col-span-3"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="teamLogo" className="text-right">
          סמל קבוצה
        </Label>
        <Input
          id="teamLogo"
          value={teamLogo}
          onChange={(e) => setTeamLogo(e.target.value)}
          className="col-span-3"
          placeholder="URL של סמל הקבוצה"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          קטגוריה
        </Label>
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
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">
          סטטוס
        </Label>
        <div className="col-span-3 flex gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isOwned"
              checked={isOwned}
              onChange={(e) => setIsOwned(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            <Label htmlFor="isOwned" className="cursor-pointer">יש ברשותי</Label>
          </div>
          
          {isOwned && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="isDuplicate"
                checked={isDuplicate}
                onChange={(e) => setIsDuplicate(e.target.checked)}
                className="form-checkbox h-4 w-4"
              />
              <Label htmlFor="isDuplicate" className="cursor-pointer">כפול</Label>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormFields;
