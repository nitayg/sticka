
import React from "react";
import { Input } from "../ui/input";

interface InventorySearchControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const InventorySearchControls = ({
  searchTerm,
  onSearchChange
}: InventorySearchControlsProps) => {
  return (
    <Input 
      type="text" 
      placeholder="חפש לפי מספר, שחקן או מועדון..." 
      className="w-full p-2 border rounded-md" 
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
};

export default InventorySearchControls;
