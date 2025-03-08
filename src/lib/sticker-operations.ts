
import { Sticker } from './types';
import { v4 as uuidv4 } from 'uuid';
import { saveToStorage, getFromStorage } from './sync';
import { toast } from '@/components/ui/use-toast';
import { supabase } from './supabase';

// Storage for stickers data
let stickersData: Sticker[] = [];

// Function to set sticker data (used when data is updated from another tab)
export const setStickerData = (stickers: Sticker[]) => {
  stickersData = stickers;
  saveToStorage('stickers', stickers, false);
};

// Function to get sticker data
export const getStickerData = () => {
  if (stickersData.length === 0) {
    stickersData = getFromStorage<Sticker[]>('stickers', []);
  }
  return stickersData;
};

// Function to get all stickers by album ID
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  const stickers = getStickerData();
  return stickers.filter(sticker => sticker.albumId === albumId);
};

// Function to add a new sticker
export const addSticker = (stickerData: Omit<Sticker, 'id' | 'lastModified'>): Sticker => {
  const newSticker: Sticker = {
    id: uuidv4(),
    ...stickerData,
    lastModified: Date.now()
  };

  const stickers = getStickerData();
  const updatedStickers = [...stickers, newSticker];
  setStickerData(updatedStickers);
  return newSticker;
};

// Function to update an existing sticker
export const updateSticker = (stickerId: string, updates: Partial<Sticker>): Sticker | undefined => {
  const stickers = getStickerData();
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, ...updates, lastModified: Date.now() };
    }
    return sticker;
  });
  setStickerData(updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to delete a sticker
export const deleteSticker = (stickerId: string): void => {
  const stickers = getStickerData();
  const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
  setStickerData(updatedStickers);
};

// Function to toggle the 'owned' status of a sticker
export const toggleStickerOwned = (stickerId: string): Sticker | undefined => {
  const stickers = getStickerData();
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, isOwned: !sticker.isOwned, lastModified: Date.now() };
    }
    return sticker;
  });
  setStickerData(updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to toggle the 'duplicate' status of a sticker
export const toggleStickerDuplicate = (stickerId: string): Sticker | undefined => {
  const stickers = getStickerData();
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, isDuplicate: !sticker.isDuplicate, lastModified: Date.now() };
    }
    return sticker;
  });
  setStickerData(updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to import stickers from a CSV file
export const importStickersFromCSV = (albumId: string, csvData: [number, string, string][]): Sticker[] => {
  const newStickers: Sticker[] = [];
  console.log(`Importing ${csvData.length} stickers for album ${albumId}`);
  
  for (const [number, name, team] of csvData) {
    // Skip invalid entries
    if (!number || number <= 0) continue;
    
    const stickerId = `sticker_${albumId}_${number}_${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    
    const newSticker: Sticker = {
      id: stickerId,
      albumId: albumId,
      name: name || `מדבקה #${number}`,
      team: team || "",
      category: "שחקנים",
      number: number,
      imageUrl: "",
      isOwned: false,
      isDuplicate: false,
      duplicateCount: 0,
      lastModified: Date.now(),
      isDeleted: false
    };
    newStickers.push(newSticker);
  }

  const stickers = getStickerData();
  const updatedStickers = [...stickers, ...newStickers];
  setStickerData(updatedStickers);
  
  console.log(`Successfully imported ${newStickers.length} stickers for album ${albumId}`);
  
  // מיד לאחר היבוא, מפעילים אירוע כדי להודיע לממשק על השינוי
  window.dispatchEvent(new CustomEvent('stickerDataChanged', { detail: { albumId } }));
  
  return newStickers;
};

// Function to import stickers from Excel file
export const importStickersFromExcel = async (file: File, albumId: string): Promise<{ importedCount: number, errorCount: number }> => {
  // This is a placeholder implementation - in a real app, you'd use a library like xlsx to parse Excel files
  try {
    // Mock implementation - in a real app you would parse the Excel file here
    const mockCsvData: [number, string, string][] = [];
    
    // Generate some mock data based on the file name
    for (let i = 1; i <= 10; i++) {
      mockCsvData.push([i, `Sticker ${i} from ${file.name}`, `Team ${i % 3 + 1}`]);
    }
    
    const newStickers = importStickersFromCSV(albumId, mockCsvData);
    
    return {
      importedCount: newStickers.length,
      errorCount: 0
    };
  } catch (error) {
    console.error("Error importing Excel:", error);
    throw new Error("Failed to parse Excel file");
  }
};

// Function to get sticker statistics
export const getStats = (): { total: number; owned: number; needed: number; duplicates: number } => {
  const stickers = getStickerData();
  const total = stickers.length;
  const owned = stickers.filter(sticker => sticker.isOwned).length;
  const needed = total - owned;
  const duplicates = stickers.filter(sticker => sticker.isDuplicate).length;
  return { total, owned, needed, duplicates };
};

// Function to add multiple stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: number[]): { 
  newlyOwned: number[]; 
  duplicatesUpdated: number[]; 
  notFound: number[] 
} => {
  const albumStickers = getStickersByAlbumId(albumId);
  const newlyOwned: number[] = [];
  const duplicatesUpdated: number[] = [];
  const notFound: number[] = [];
  
  for (const number of stickerNumbers) {
    const sticker = albumStickers.find(s => s.number === number);
    
    if (sticker) {
      if (!sticker.isOwned) {
        // Mark as owned
        updateSticker(sticker.id, { isOwned: true });
        newlyOwned.push(number);
      } else if (!sticker.isDuplicate) {
        // Mark as duplicate
        updateSticker(sticker.id, { isDuplicate: true });
        duplicatesUpdated.push(number);
      } else {
        // Already owned and marked as duplicate
        duplicatesUpdated.push(number);
      }
    } else {
      notFound.push(number);
    }
  }
  
  return { newlyOwned, duplicatesUpdated, notFound };
};

// Function to update team names across stickers
export const updateTeamNameAcrossStickers = (oldName: string, newName: string, newLogo?: string): number => {
  const stickers = getStickerData();
  let updatedCount = 0;
  
  const updatedStickers = stickers.map(sticker => {
    if (sticker.team === oldName) {
      updatedCount++;
      const updates: Partial<Sticker> = { 
        team: newName, 
        lastModified: Date.now() 
      };
      
      if (newLogo) {
        updates.teamLogo = newLogo;
      }
      
      return { ...sticker, ...updates };
    }
    return sticker;
  });
  
  setStickerData(updatedStickers);
  return updatedCount;
};
