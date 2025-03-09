
import { generateId } from '../utils';
import { stickers as stickersData } from '../initial-data';
import { Sticker } from '../types';
import { saveToStorage, getFromStorage } from '../sync/storage-utils';

// Get all stickers data
export const getStickerData = (): Sticker[] => {
  return getFromStorage('stickers', stickersData);
};

// Save stickers data
export const setStickerData = (data: Sticker[]): void => {
  console.log(`Saving ${data.length} stickers to storage`);
  saveToStorage('stickers', data);
};

// Get stickers by album ID
export const getStickersByAlbumId = (albumId: string): Sticker[] => {
  const allStickers = getStickerData();
  if (!albumId) return [];
  
  console.log(`Getting stickers for album ${albumId}. Total stickers: ${allStickers.length}`);
  
  const filteredStickers = allStickers.filter(sticker => sticker.albumId === albumId);
  console.log(`Found ${filteredStickers.length} stickers for album ${albumId}`);
  
  return filteredStickers;
};
