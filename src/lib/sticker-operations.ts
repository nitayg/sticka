
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
  
  for (const [number, name, team] of csvData) {
    const newSticker: Sticker = {
      id: uuidv4(),
      albumId: albumId,
      name: name || "",
      team: team || "",
      category: "שחקנים",
      number: typeof number === 'number' ? number : 0,
      imageUrl: "",
      isOwned: false,
      isDuplicate: false,
      lastModified: Date.now()
    };
    newStickers.push(newSticker);
  }

  const stickers = getStickerData();
  const updatedStickers = [...stickers, ...newStickers];
  setStickerData(updatedStickers);
  
  return newStickers;
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
