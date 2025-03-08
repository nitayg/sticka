
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
export const addSticker = async (albumId: string, imageUrl: string): Promise<Sticker> => {
  const newSticker: Sticker = {
    id: uuidv4(),
    albumId: albumId,
    name: "",
    team: "",
    category: "",
    number: 0,
    imageUrl: imageUrl,
    isOwned: false,
    isDuplicate: false,
    lastModified: Date.now()
  };

  const stickers = getStickerData();
  const updatedStickers = [...stickers, newSticker];
  setStickerData(updatedStickers);
  return newSticker;
};

// Function to update an existing sticker
export const updateSticker = async (stickerId: string, updates: Partial<Sticker>): Promise<Sticker | undefined> => {
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
export const deleteSticker = async (stickerId: string): Promise<void> => {
  const stickers = getStickerData();
  const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
  setStickerData(updatedStickers);
};

// Function to toggle the 'owned' status of a sticker
export const toggleStickerOwned = async (stickerId: string): Promise<Sticker | undefined> => {
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
export const toggleStickerDuplicate = async (stickerId: string): Promise<Sticker | undefined> => {
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
export const importStickersFromCSV = async (albumId: string, csvData: any[]): Promise<Sticker[]> => {
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
export const getStats = (): { total: number; owned: number; duplicates: number } => {
  const stickers = getStickerData();
  const total = stickers.length;
  const owned = stickers.filter(sticker => sticker.isOwned).length;
  const duplicates = stickers.filter(sticker => sticker.isDuplicate).length;
  return { total, owned, duplicates };
};

// Function to add multiple stickers to inventory
export const addStickersToInventory = async (albumId: string, numberOfStickers: number): Promise<Sticker[]> => {
  const newStickers: Sticker[] = [];
  for (let i = 0; i < numberOfStickers; i++) {
    const newSticker: Sticker = {
      id: uuidv4(),
      albumId: albumId,
      name: "",
      team: "",
      category: "שחקנים",
      number: i + 1,
      imageUrl: '',
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

// Function to update team names across stickers
export const updateTeamNameAcrossStickers = (oldName: string, newName: string): Promise<void> => {
  const stickers = getStickerData();
  const updatedStickers = stickers.map(sticker => {
    if (sticker.team === oldName) {
      return { ...sticker, team: newName, lastModified: Date.now() };
    }
    return sticker;
  });
  setStickerData(updatedStickers);
  return Promise.resolve();
};
