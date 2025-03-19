
import { useState, useMemo, useEffect } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sticker } from "@/lib/types";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker } from "@/lib/sticker-operations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../ui/use-toast";

interface InventoryTableProps {
  stickers: Sticker[];
  onRefresh: () => void;
  activeTab: string;
}

const InventoryTable = ({ stickers, onRefresh, activeTab }: InventoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{
    key: "number" | "name" | "team" | "inventory";
    direction: "ascending" | "descending";
  }>({
    key: "number",
    direction: "ascending"
  });

  // Reset selected stickers when stickers change or select mode is disabled
  useEffect(() => {
    if (!isSelectMode) {
      setSelectedStickers([]);
    }
  }, [stickers, isSelectMode]);

  // Filter stickers based on search term
  const filteredStickers = useMemo(() => {
    return stickers.filter(sticker => {
      const searchLower = searchTerm.toLowerCase();
      return (
        sticker.number.toString().includes(searchTerm) ||
        (sticker.name && sticker.name.toLowerCase().includes(searchLower)) ||
        (sticker.team && sticker.team.toLowerCase().includes(searchLower))
      );
    });
  }, [stickers, searchTerm]);

  // Sort stickers based on sort configuration
  const sortedStickers = useMemo(() => {
    const sorted = [...filteredStickers];
    sorted.sort((a, b) => {
      if (sortConfig.key === "number") {
        return sortConfig.direction === "ascending" 
          ? a.number - b.number 
          : b.number - a.number;
      } else if (sortConfig.key === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return sortConfig.direction === "ascending"
          ? nameA.localeCompare(nameB, "he")
          : nameB.localeCompare(nameA, "he");
      } else if (sortConfig.key === "team") {
        const teamA = a.team || "";
        const teamB = b.team || "";
        return sortConfig.direction === "ascending"
          ? teamA.localeCompare(teamB, "he")
          : teamB.localeCompare(teamA, "he");
      } else {
        // Sort by inventory (duplicateCount)
        const countA = a.isOwned ? (a.duplicateCount || 0) + 1 : 0;
        const countB = b.isOwned ? (b.duplicateCount || 0) + 1 : 0;
        return sortConfig.direction === "ascending"
          ? countA - countB
          : countB - countA;
      }
    });
    return sorted;
  }, [filteredStickers, sortConfig]);

  // Handle sorting when clicking on table headers
  const requestSort = (key: "number" | "name" | "team" | "inventory") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key: "number" | "name" | "team" | "inventory") => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  // Toggle select all stickers
  const toggleSelectAll = () => {
    if (selectedStickers.length === sortedStickers.length) {
      setSelectedStickers([]);
    } else {
      setSelectedStickers(sortedStickers.map(sticker => sticker.id));
    }
  };

  // Toggle selection of a single sticker
  const toggleStickerSelection = (stickerId: string) => {
    if (selectedStickers.includes(stickerId)) {
      setSelectedStickers(selectedStickers.filter(id => id !== stickerId));
    } else {
      setSelectedStickers([...selectedStickers, stickerId]);
    }
  };

  // Handle inventory update for a single sticker
  const handleInventoryUpdate = async (sticker: Sticker, increment: boolean) => {
    try {
      if (!sticker.isOwned && increment) {
        // If not owned and incrementing, toggle to owned
        await toggleStickerOwned(sticker.id);
      } else if (sticker.isOwned) {
        if (increment) {
          // If owned and incrementing, increase duplicate count
          const newCount = (sticker.duplicateCount || 0) + 1;
          await updateSticker(sticker.id, { 
            isDuplicate: true, 
            duplicateCount: newCount 
          });
        } else {
          // If owned and decrementing
          const currentCount = sticker.duplicateCount || 0;
          if (currentCount > 0) {
            // If has duplicates, decrease duplicate count
            await updateSticker(sticker.id, { 
              isDuplicate: currentCount - 1 > 0, 
              duplicateCount: currentCount - 1 
            });
          } else {
            // If no duplicates, toggle to not owned
            await toggleStickerOwned(sticker.id);
          }
        }
      }

      // Refresh inventory after update
      onRefresh();

      // Trigger events for syncing
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { action: 'update' } 
      }));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      // Show toast notification
      toast({
        title: increment ? "מדבקה נוספה למלאי" : "מדבקה הוסרה מהמלאי",
        description: `מדבקה מספר ${sticker.number} ${increment ? "נוספה" : "הוסרה"} ${sticker.name ? `(${sticker.name})` : ""}`,
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "שגיאה בעדכון המלאי",
        description: "אירעה שגיאה בעת עדכון המלאי",
        variant: "destructive"
      });
    }
  };

  // Handle bulk updating multiple stickers
  const handleBulkInventoryUpdate = async (increment: boolean) => {
    if (selectedStickers.length === 0) return;
    
    try {
      const updatePromises = selectedStickers.map(stickerId => {
        const sticker = stickers.find(s => s.id === stickerId);
        if (!sticker) return Promise.resolve();
        
        if (!sticker.isOwned && increment) {
          return toggleStickerOwned(sticker.id);
        } else if (sticker.isOwned) {
          if (increment) {
            const newCount = (sticker.duplicateCount || 0) + 1;
            return updateSticker(sticker.id, { 
              isDuplicate: true, 
              duplicateCount: newCount 
            });
          } else {
            const currentCount = sticker.duplicateCount || 0;
            if (currentCount > 0) {
              return updateSticker(sticker.id, { 
                isDuplicate: currentCount - 1 > 0, 
                duplicateCount: currentCount - 1 
              });
            } else {
              return toggleStickerOwned(sticker.id);
            }
          }
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      // Refresh inventory and show toast
      onRefresh();
      
      // Trigger sync events
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { action: 'bulkUpdate' } 
      }));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      
      toast({
        title: increment ? "מדבקות נוספו למלאי" : "מדבקות הוסרו מהמלאי",
        description: `${selectedStickers.length} מדבקות ${increment ? "נוספו" : "הוסרו"} מהמלאי`,
      });
      
      // Exit select mode
      setIsSelectMode(false);
    } catch (error) {
      console.error("Error updating inventory in bulk:", error);
      toast({
        title: "שגיאה בעדכון המלאי",
        description: "אירעה שגיאה בעת עדכון המלאי בצורה מרובה",
        variant: "destructive"
      });
    }
  };

  // Calculate inventory count for a sticker
  const getInventoryCount = (sticker: Sticker) => {
    if (!sticker.isOwned) return 0;
    return (sticker.duplicateCount || 0) + 1; // Add 1 for the owned sticker
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input 
          type="text" 
          placeholder="חפש לפי מספר, שחקן או מועדון..." 
          className="w-full p-2 border rounded-md" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex items-center gap-2 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSelectMode(!isSelectMode)}
          >
            {isSelectMode ? "ביטול בחירה" : "בחירה מרובה"}
          </Button>
          
          {isSelectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedStickers.length === sortedStickers.length ? "נקה הכל" : "בחר הכל"}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => handleBulkInventoryUpdate(true)}
                disabled={selectedStickers.length === 0}
              >
                הוסף {selectedStickers.length} למלאי
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="relative rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead className="bg-background sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {isSelectMode && (
                <th className="p-3">
                  <Checkbox 
                    checked={selectedStickers.length === sortedStickers.length && sortedStickers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
              )}
              <th 
                className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => requestSort("number")}
              >
                מספר {getSortDirectionIcon("number")}
              </th>
              <th 
                className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => requestSort("name")}
              >
                שחקן {getSortDirectionIcon("name")}
              </th>
              <th 
                className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => requestSort("team")}
              >
                מועדון {getSortDirectionIcon("team")}
              </th>
              <th 
                className="p-3 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => requestSort("inventory")}
              >
                מלאי {getSortDirectionIcon("inventory")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStickers.map((sticker, index) => {
              const inventoryCount = getInventoryCount(sticker);
              const isEven = index % 2 === 0;
              const isSelected = selectedStickers.includes(sticker.id);
              
              return (
                <tr 
                  key={sticker.id} 
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    isEven ? "bg-gray-50 dark:bg-gray-800/50" : "bg-transparent",
                    isSelected && "bg-primary-100 dark:bg-primary-900/20",
                    sticker.isOwned && "text-green-700 dark:text-green-400"
                  )}
                  onClick={() => isSelectMode && toggleStickerSelection(sticker.id)}
                >
                  {isSelectMode && (
                    <td className="p-3 text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleStickerSelection(sticker.id)}
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
                          handleInventoryUpdate(sticker, false);
                        }}
                        disabled={!sticker.isOwned}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      
                      <span className={cn(
                        "font-medium w-5 text-center",
                        inventoryCount === 0 ? "text-red-500" : "text-green-500"
                      )}>
                        {inventoryCount}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInventoryUpdate(sticker, true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
