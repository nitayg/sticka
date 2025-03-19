
import React from "react";
import { Button } from "../ui/button";

interface InventoryBulkControlsProps {
  isSelectMode: boolean;
  selectedCount: number;
  onToggleSelectMode: () => void;
  onToggleSelectAll: () => void;
  onBulkAdd: () => void;
  totalItems: number;
}

const InventoryBulkControls = ({
  isSelectMode,
  selectedCount,
  onToggleSelectMode,
  onToggleSelectAll,
  onBulkAdd,
  totalItems
}: InventoryBulkControlsProps) => {
  return (
    <div className="flex items-center gap-2 mr-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelectMode}
      >
        {isSelectMode ? "ביטול בחירה" : "בחירה מרובה"}
      </Button>
      
      {isSelectMode && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSelectAll}
          >
            {selectedCount === totalItems ? "נקה הכל" : "בחר הכל"}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onBulkAdd}
            disabled={selectedCount === 0}
          >
            הוסף {selectedCount} למלאי
          </Button>
        </>
      )}
    </div>
  );
};

export default InventoryBulkControls;
