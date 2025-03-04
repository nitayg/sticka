
import { Sticker } from "@/lib/types";

// Utility function to check if a sticker was recently added (within the last 5 minutes)
export const isRecentlyAdded = (sticker: Sticker): boolean => {
  // Mock implementation - in a real app, you would compare with the actual creation timestamp
  const recentStickerIds = ["sticker1", "sticker5", "sticker12"]; // Example for demo
  return recentStickerIds.includes(sticker.id);
};
