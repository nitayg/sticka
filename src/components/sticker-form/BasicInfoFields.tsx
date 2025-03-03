
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface BasicInfoFieldsProps {
  name: string;
  setName: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  team: string;
  setTeam: (value: string) => void;
}

const BasicInfoFields = ({
  name,
  setName,
  number,
  setNumber,
  team,
  setTeam
}: BasicInfoFieldsProps) => {
  return (
    <>
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
    </>
  );
};

export default BasicInfoFields;
