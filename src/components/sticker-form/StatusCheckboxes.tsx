
import React from "react";
import { Label } from "../ui/label";

interface StatusCheckboxesProps {
  isOwned: boolean;
  setIsOwned: (value: boolean) => void;
  isDuplicate: boolean;
  setIsDuplicate: (value: boolean) => void;
}

const StatusCheckboxes = ({
  isOwned,
  setIsOwned,
  isDuplicate,
  setIsDuplicate
}: StatusCheckboxesProps) => {
  return (
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
  );
};

export default StatusCheckboxes;
