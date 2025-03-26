
import React, { useState, useEffect, useCallback } from "react";
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
  // Local state for optimistic UI updates
  const [localInventoryCount, setLocalInventoryCount] = useState<number>(
    sticker.isOwned ? (sticker.duplicateCount || 0) + 1 : 0
  );
  
  // Update local state when sticker prop changes, but avoid unnecessary updates
  useEffect(() => {
    const newCount = sticker.isOwned ? (sticker.duplicateCount || 0) + 1 : 0;
    if (localInventoryCount !== newCount) {
      setLocalInventoryCount(newCount);
    }
  }, [sticker.isOwned, sticker.duplicateCount, sticker.id]);

  const isEven = index % 2 === 0;

  // Memoize handler to prevent recreating it on each render
  const handleUpdateInventory = useCallback((increment: boolean) => {
    // Update local state immediately for optimistic UI
    if (increment) {
      setLocalInventoryCount(prev => prev + 1);
    } else if (localInventoryCount > 0) {
      setLocalInventoryCount(prev => prev - 1);
    }
    
    // Call the actual update function
    onUpdateInventory(sticker, increment);
  }, [sticker, localInventoryCount, onUpdateInventory]);

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
              handleUpdateInventory(false);
            }}
            disabled={!sticker.isOwned}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          
          <span className={cn(
            "font-medium w-5 text-center",
            localInventoryCount === 0 ? "text-red-500" : "text-green-500"
          )}>
            {localInventoryCount}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateInventory(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(InventoryTableRow);
