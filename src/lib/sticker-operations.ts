import { Sticker } from './types';
import { v4 as uuidv4 } from 'uuid';
import { saveToStorage, getFromStorage } from './sync';
import { toast } from '@/components/ui/use-toast';
import { supabase } from './supabase';

// Function to set sticker data (used when data is updated from another tab)
export const setStickerData = (stickers: Sticker[]) => {
  saveToStorage('stickers', stickers, false);
};

// Function to get all stickers by album ID
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  return stickers.filter(sticker => sticker.albumId === albumId);
};

// Function to add a new sticker
export const addSticker = async (albumId: string, imageUrl: string): Promise<Sticker> => {
  const newSticker: Sticker = {
    id: uuidv4(),
    albumId: albumId,
    imageUrl: imageUrl,
    owned: false,
    duplicate: false,
    lastModified: Date.now()
  };

  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = [...stickers, newSticker];
  saveToStorage('stickers', updatedStickers);
  return newSticker;
};

// Function to update an existing sticker
export const updateSticker = async (stickerId: string, updates: Partial<Sticker>): Promise<Sticker | undefined> => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, ...updates, lastModified: Date.now() };
    }
    return sticker;
  });
  saveToStorage('stickers', updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to delete a sticker
export const deleteSticker = async (stickerId: string): Promise<void> => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
  saveToStorage('stickers', updatedStickers);
};

// Function to toggle the 'owned' status of a sticker
export const toggleStickerOwned = async (stickerId: string): Promise<Sticker | undefined> => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, owned: !sticker.owned, lastModified: Date.now() };
    }
    return sticker;
  });
  saveToStorage('stickers', updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to toggle the 'duplicate' status of a sticker
export const toggleStickerDuplicate = async (stickerId: string): Promise<Sticker | undefined> => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = stickers.map(sticker => {
    if (sticker.id === stickerId) {
      return { ...sticker, duplicate: !sticker.duplicate, lastModified: Date.now() };
    }
    return sticker;
  });
  saveToStorage('stickers', updatedStickers);
  return updatedStickers.find(sticker => sticker.id === stickerId);
};

// Function to import stickers from a CSV file
export const importStickersFromCSV = async (albumId: string, csvData: string): Promise<void> => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  const imageUrlIndex = headers.findIndex(header => header.trim() === 'imageUrl');

  if (imageUrlIndex === -1) {
    throw new Error('CSV file must have a column named "imageUrl"');
  }

  const newStickers: Sticker[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length > imageUrlIndex) {
      const imageUrl = values[imageUrlIndex].trim();
      if (imageUrl) {
        const newSticker: Sticker = {
          id: uuidv4(),
          albumId: albumId,
          imageUrl: imageUrl,
          owned: false,
          duplicate: false,
          lastModified: Date.now()
        };
        newStickers.push(newSticker);
      }
    }
  }

  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = [...stickers, ...newStickers];
  saveToStorage('stickers', updatedStickers);
};

// Function to get sticker statistics
export const getStats = (): { total: number; owned: number; duplicates: number } => {
  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const total = stickers.length;
  const owned = stickers.filter(sticker => sticker.owned).length;
  const duplicates = stickers.filter(sticker => sticker.duplicate).length;
  return { total, owned, duplicates };
};

// Function to add multiple stickers to inventory
export const addStickersToInventory = async (albumId: string, numberOfStickers: number): Promise<void> => {
  const newStickers: Sticker[] = [];
  for (let i = 0; i < numberOfStickers; i++) {
    const newSticker: Sticker = {
      id: uuidv4(),
      albumId: albumId,
      imageUrl: '', // You might want to generate a default image URL or leave it empty
      owned: false,
      duplicate: false,
      lastModified: Date.now()
    };
    newStickers.push(newSticker);
  }

  const stickers = getFromStorage<Sticker[]>('stickers', []);
  const updatedStickers = [...stickers, ...newStickers];
  saveToStorage('stickers', updatedStickers);
};
