
import { Album } from './types';
import { albums as initialAlbums } from './initial-data';
import { stickerData, setStickerData } from './sticker-operations';
import { saveToStorage, syncWithSupabase } from './sync-manager';

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
  return albumData;
};

export const getAlbumById = (id: string) => {
  return albumData.find(album => album.id === id);
};

export const addAlbum = (album: Omit<Album, "id">) => {
  // Generate a truly unique ID with a timestamp component
  // Include device identifiable information to prevent conflicts
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const devicePrefix = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') 
    ? 'ios' 
    : navigator.userAgent.includes('Android') 
      ? 'android' 
      : 'web';
  
  const newAlbum = {
    ...album,
    id: `album_${devicePrefix}_${timestamp}_${random}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Update local state
  const updatedAlbums = [...albumData, newAlbum];
  setAlbumData(updatedAlbums);
  
  console.log(`[Albums] Added new album: ${newAlbum.id} (${newAlbum.name})`);
  
  // Force a sync with Supabase to ensure real-time updates
  syncWithSupabase();
  
  return newAlbum;
};

export const updateAlbum = (id: string, data: Partial<Album>) => {
  // Update the album with new data
  const updatedAlbums = albumData.map(album => 
    album.id === id ? { 
      ...album, 
      ...data, 
      updatedAt: new Date().toISOString() 
    } : album
  );
  
  // Set the updated data
  setAlbumData(updatedAlbums);
  
  console.log(`[Albums] Updated album: ${id}`);
  
  // Force a sync with Supabase to ensure real-time updates
  syncWithSupabase();
  
  return updatedAlbums.find(album => album.id === id);
};

export const deleteAlbum = (id: string) => {
  console.log(`[Albums] Deleting album: ${id}`);
  
  // Remove the album from the data
  const updatedAlbums = albumData.filter(album => album.id !== id);
  setAlbumData(updatedAlbums);
  
  // Also delete all stickers associated with this album
  const updatedStickers = stickerData.filter(sticker => sticker.albumId !== id);
  setStickerData(updatedStickers);
  
  console.log(`[Albums] Deleted album: ${id} and its associated stickers`);
  
  // Force a sync with Supabase to ensure real-time updates
  syncWithSupabase();
};
