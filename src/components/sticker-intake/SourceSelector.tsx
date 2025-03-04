
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type SourceType = "exchange" | "pack" | "other";

interface SourceSelectorProps {
  source: SourceType;
  setSource: (source: SourceType) => void;
}

const SourceSelector = ({ source, setSource }: SourceSelectorProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="source" className="text-right">
        מקור *
      </Label>
      <Select 
        value={source} 
        onValueChange={(value) => setSource(value as SourceType)}
      >
        <SelectTrigger id="source" className="col-span-3">
          <SelectValue placeholder="בחר מקור" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pack">מעטפה</SelectItem>
          <SelectItem value="exchange">החלפה</SelectItem>
          <SelectItem value="other">אחר</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SourceSelector;
