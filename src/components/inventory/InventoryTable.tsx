
import { useState, useMemo } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sticker } from "@/lib/types";
import { toggleStickerOwned, toggleStickerDuplicate, updateSticker } from "@/lib/sticker-operations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface InventoryTableProps {
  stickers: Sticker[];
  onRefresh: () => void;
  activeTab: string;
}

const InventoryTable = ({ stickers, onRefresh, activeTab }: InventoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: "number" | "name" | "team" | "inventory";
    direction: "ascending" | "descending";
  }>({
    key: "number",
    direction: "ascending"
  });

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

  // Handle inventory update
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
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  // Calculate inventory count for a sticker
  const getInventoryCount = (sticker: Sticker) => {
    if (!sticker.isOwned) return 0;
    return (sticker.duplicateCount || 0) + 1; // Add 1 for the owned sticker
  };

  return (
    <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden">
      <Input 
        type="text" 
        placeholder="חפש לפי מספר, שחקן או מועדון..." 
        className="w-full p-2 mb-4 border rounded-md" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="relative rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead className="bg-background sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
            <tr>
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
              
              return (
                <tr 
                  key={sticker.id} 
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    isEven ? "bg-gray-50 dark:bg-gray-800/50" : "bg-transparent"
                  )}
                >
                  <td className="p-3 text-right">#{sticker.number}</td>
                  <td className="p-3 text-right">{sticker.name || "—"}</td>
                  <td className="p-3 text-right">{sticker.team || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleInventoryUpdate(sticker, false)}
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
                        onClick={() => handleInventoryUpdate(sticker, true)}
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
