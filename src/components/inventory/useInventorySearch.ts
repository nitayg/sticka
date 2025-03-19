
import { useState, useMemo } from "react";
import { Sticker } from "@/lib/types";

export const useInventorySearch = (stickers: Sticker[]) => {
  const [searchTerm, setSearchTerm] = useState("");

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

  return {
    searchTerm,
    setSearchTerm,
    filteredStickers
  };
};
