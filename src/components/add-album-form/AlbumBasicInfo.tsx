
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AlbumBasicInfoProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  year: number | string;
  setYear: (value: string) => void;
  totalStickers: number | string;
  setTotalStickers: (value: string) => void;
}

const AlbumBasicInfo = ({
  name,
  setName,
  description,
  setDescription,
  year,
  setYear,
  totalStickers,
  setTotalStickers
}: AlbumBasicInfoProps) => {
  return (
    <div className="space-y-3 text-right">
      <div className="grid grid-cols-4 items-center gap-2">
        <Label htmlFor="name" className="text-right">
          שם האלבום *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
          dir="rtl"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-2">
        <Label htmlFor="description" className="text-right">
          תיאור
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          dir="rtl"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-2">
        <Label htmlFor="year" className="text-right">
          שנה
        </Label>
        <Input
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="col-span-3"
          dir="rtl"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-2">
        <Label htmlFor="totalStickers" className="text-right">
          כמות מדבקות *
        </Label>
        <Input
          id="totalStickers"
          type="number"
          value={totalStickers}
          onChange={(e) => setTotalStickers(e.target.value)}
          className="col-span-3"
          required
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default AlbumBasicInfo;
