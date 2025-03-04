
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowLeftRight, Package, CirclePlus } from "lucide-react";

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
          <SelectItem value="pack" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>מעטפה</span>
            </div>
          </SelectItem>
          <SelectItem value="exchange" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span>החלפה</span>
            </div>
          </SelectItem>
          <SelectItem value="other" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CirclePlus className="h-4 w-4" />
              <span>אחר</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SourceSelector;
