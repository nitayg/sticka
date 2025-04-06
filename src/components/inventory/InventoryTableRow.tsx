
import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Sticker } from "@/lib/types";

interface InventoryTableRowProps {
  sticker: Sticker;
  index: number;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelection: (stickerId: string) => void;
  onUpdateInventory: (sticker: Sticker, increment: boolean) => void;
}

const InventoryTableRow = ({
  sticker,
  index,
  isSelectMode,
  isSelected,
  onToggleSelection,
  onUpdateInventory
}: InventoryTableRowProps) => {
  const inventoryCount = sticker.isOwned ? (sticker.duplicateCount || 0) + 1 : 0;
  const isEven = index % 2 === 0;
  
  // Add optimistic UI update with proper persistence
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  
  // Reset optimistic count when sticker data changes from parent
  useEffect(() => {
    setOptimisticCount(null);
  }, [sticker.isOwned, sticker.duplicateCount]);
  
  // Display either the optimistic count or the actual count
  const displayCount = optimisticCount !== null ? optimisticCount : inventoryCount;

  // Handle inventory update with optimistic UI that persists
  const handleInventoryUpdate = (increment: boolean) => {
    // Calculate new count optimistically
    const newCount = increment 
      ? displayCount + 1 
      : Math.max(0, displayCount - 1);
    
    // Update UI immediately
    setOptimisticCount(newCount);
    
    // Call the actual update
    onUpdateInventory(sticker, increment);
  };

  return (
    <tr 
      className={cn(
        "transition-colors hover:bg-muted/50",
        isEven ? "bg-gray-50 dark:bg-gray-800/50" : "bg-transparent",
        isSelected && "bg-primary-100 dark:bg-primary-900/20",
        sticker.isOwned && "text-green-700 dark:text-green-400"
      )}
      onClick={() => isSelectMode && onToggleSelection(sticker.id)}
    >
      {isSelectMode && (
        <td className="p-3 text-center">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(sticker.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td className="p-3 text-right">#{sticker.number}</td>
      <td className="p-3 text-right">{sticker.name || "—"}</td>
      <td className="p-3 text-right">{sticker.team || "—"}</td>
      <td className="p-3">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleInventoryUpdate(false);
            }}
            disabled={!sticker.isOwned}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          
          <span className={cn(
            "font-medium w-5 text-center transition-all duration-300",
            displayCount === 0 ? "text-red-500" : "text-green-500",
            optimisticCount !== null && "animate-pulse"
          )}>
            {displayCount}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleInventoryUpdate(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default InventoryTableRow;
