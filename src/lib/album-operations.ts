
import { Album } from './types';
import { albums as initialAlbums } from './initial-data';
import { setStickerData, getStickerData } from './sticker-operations';
import { saveToStorage, syncWithSupabase, getFromStorage } from './sync';
import { markRelatedItemsAsDeleted } from './sync/merge-utils';

// Maintain data state
let albumData = [...initialAlbums];

export const getAlbumData = () => albumData;
export const setAlbumData = (data: Album[]) => {
  albumData = data;
  // Save to localStorage and Supabase whenever data changes
  saveToStorage('albums', albumData);
  
  // Notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
};

export const getAllAlbums = () => {
  // Filter out deleted albums
  return albumData.filter(album => !album.isDeleted);
};

export const getAlbumById = (id: string) => {
  return albumData.find(album => album.id === id && !album.isDeleted);
};

export const addAlbum = (album: Omit<Album, "id">) => {
  // Generate a truly unique ID with a timestamp component
  // Format: album_<timestamp>_<random string>
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const newAlbum = {
    ...album,
    id: `album_${timestamp}_${random}`,
    lastModified: timestamp,
    isDeleted: false
  };
  
  setAlbumData([...albumData, newAlbum]);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  // Force a sync with Supabase to ensure changes are saved
  syncWithSupabase();
  
  return newAlbum;
};

export const updateAlbum = (id: string, data: Partial<Album>) => {
  const timestamp = Date.now();
  
  setAlbumData(albumData.map(album => 
    album.id === id ? { 
      ...album, 
      ...data,
      lastModified: timestamp
    } : album
  ));
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  // Force a sync with Supabase to ensure changes are saved
  syncWithSupabase();
  
  return albumData.find(album => album.id === id);
};

export const deleteAlbum = (id: string) => {
  const timestamp = Date.now();
  
  // 1. Mark album as deleted
  setAlbumData(albumData.map(album => 
    album.id === id ? {
      ...album,
      isDeleted: true,
      lastModified: timestamp
    } : album
  ));
  
  // 2. Mark all related stickers as deleted too
  const stickers = getStickerData();
  setStickerData(markRelatedItemsAsDeleted(stickers, id, timestamp));
  
  // 3. Get exchange offers (including deleted ones for sync purposes)
  const exchangeOffers = getFromStorage('exchangeOffers', [], true);
  
  // 4. Mark related exchange offers as deleted
  const updatedExchangeOffers = markRelatedItemsAsDeleted(exchangeOffers, id, timestamp);
  saveToStorage('exchangeOffers', updatedExchangeOffers);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  // Force a sync with Supabase to ensure changes are saved
  syncWithSupabase();
};
