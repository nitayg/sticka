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
        // Improved sorting logic to handle alphanumeric values properly:
        // 1. First, check if both are alphanumeric or both are numeric
        const aIsAlpha = typeof a.number === 'string' && /^[A-Za-z]/.test(String(a.number));
        const bIsAlpha = typeof b.number === 'string' && /^[A-Za-z]/.test(String(b.number));
        
        // 2. If one is alphanumeric and one is numeric, numeric comes first
        if (aIsAlpha && !bIsAlpha) return sortConfig.direction === "ascending" ? 1 : -1;
        if (!aIsAlpha && bIsAlpha) return sortConfig.direction === "ascending" ? -1 : 1;
        
        // 3. If both are same type, sort by their values
        if (aIsAlpha && bIsAlpha) {
          // Extract the letters and numbers for better sorting
          const aMatch = String(a.number).match(/^([A-Za-z]+)(\d+)$/);
          const bMatch = String(b.number).match(/^([A-Za-z]+)(\d+)$/);
          
          if (aMatch && bMatch) {
            // If letters are different, sort by letters
            if (aMatch[1] !== bMatch[1]) {
              return sortConfig.direction === "ascending"
                ? aMatch[1].localeCompare(bMatch[1])
                : bMatch[1].localeCompare(aMatch[1]);
            }
            
            // If letters are the same, sort by numbers
            const aNum = parseInt(aMatch[2], 10);
            const bNum = parseInt(bMatch[2], 10);
            return sortConfig.direction === "ascending" ? aNum - bNum : bNum - aNum;
          }
          
          // Fallback to string comparison if pattern doesn't match
          return sortConfig.direction === "ascending"
            ? String(a.number).localeCompare(String(b.number))
            : String(b.number).localeCompare(String(a.number));
        }
        
        // 4. If both are numeric, simple numeric comparison
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
