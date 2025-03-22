
import { useMemo, useState } from "react";
import { Sticker } from "@/lib/types";

type SortKey = "number" | "name" | "team" | "inventory";

export const useStickerSort = (stickers: Sticker[]) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({
    key: "number",
    direction: "ascending"
  });

  // Handle sorting when clicking on table headers
  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort stickers based on sort configuration
  const sortedStickers = useMemo(() => {
    const sorted = [...stickers];
    sorted.sort((a, b) => {
      if (sortConfig.key === "number") {
        // Handle both string and number types for sorting
        const numA = typeof a.number === 'string' ? parseInt(a.number.replace(/\D/g, ''), 10) || 0 : a.number;
        const numB = typeof b.number === 'string' ? parseInt(b.number.replace(/\D/g, ''), 10) || 0 : b.number;
        
        return sortConfig.direction === "ascending" 
          ? numA - numB 
          : numB - numA;
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
  }, [stickers, sortConfig]);

  return {
    sortedStickers,
    sortConfig,
    requestSort
  };
};
