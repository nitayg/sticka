import { Album } from './types';
import { albums as initialAlbums } from './initial-data';
import { stickerData, setStickerData } from './sticker-operations';
import { saveToStorage } from './sync-manager';

// Maintain data state
let albumData = [...initialAlbums];

export const getAlbumData = () => albumData;
export const setAlbumData = (data: Album[]) => {
  albumData = data;
  // Save to localStorage whenever data changes
  saveToStorage('albums', albumData);
};

export const getAllAlbums = () => {
  return albumData;
};

export const getAlbumById = (id: string) => {
  return albumData.find(album => album.id === id);
};

export const addAlbum = (album: Omit<Album, "id">) => {
  const newAlbum = {
    ...album,
    id: `album${albumData.length + 1}`
  };
  setAlbumData([...albumData, newAlbum]);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return newAlbum;
};

export const updateAlbum = (id: string, data: Partial<Album>) => {
  setAlbumData(albumData.map(album => 
    album.id === id ? { ...album, ...data } : album
  ));
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return albumData.find(album => album.id === id);
};

export const deleteAlbum = (id: string) => {
  setAlbumData(albumData.filter(album => album.id !== id));
  // מחיקת כל המדבקות השייכות לאלבום זה
  const updatedStickers = stickerData.filter(sticker => sticker.albumId !== id);
  setStickerData(updatedStickers);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
};
