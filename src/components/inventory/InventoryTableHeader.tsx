
import React from "react";
import { cn } from "@/lib/utils";

interface InventoryTableHeaderProps {
  onSort: (key: "number" | "name" | "team" | "inventory") => void;
  sortConfig: {
    key: "number" | "name" | "team" | "inventory";
    direction: "ascending" | "descending";
  };
  isSelectMode: boolean;
  onToggleSelectAll: () => void;
  selectedStickersCount: number;
  totalStickersCount: number;
}

const InventoryTableHeader = ({
  onSort,
  sortConfig,
  isSelectMode,
  onToggleSelectAll,
  selectedStickersCount,
  totalStickersCount
}: InventoryTableHeaderProps) => {
  // Get sort direction icon
  const getSortDirectionIcon = (key: "number" | "name" | "team" | "inventory") => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  return (
    <thead className="bg-background sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <tr>
        {isSelectMode && (
          <th className="p-3">
            <Checkbox 
              checked={selectedStickersCount === totalStickersCount && totalStickersCount > 0}
              onCheckedChange={onToggleSelectAll}
            />
          </th>
        )}
        <th 
          className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => onSort("number")}
        >
          מספר {getSortDirectionIcon("number")}
        </th>
        <th 
          className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => onSort("name")}
        >
          שחקן {getSortDirectionIcon("name")}
        </th>
        <th 
          className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => onSort("team")}
        >
          מועדון {getSortDirectionIcon("team")}
        </th>
        <th 
          className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => onSort("inventory")}
        >
          מלאי {getSortDirectionIcon("inventory")}
        </th>
      </tr>
    </thead>
  );
};

export default InventoryTableHeader;

// Added import at the top
import { Checkbox } from "../ui/checkbox";
