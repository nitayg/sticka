import { Album } from './types';
import { stickerData, setStickerData } from './sticker-operations';
import { fetchAlbums, saveAlbum, deleteAlbumFromSupabase } from './dataService';

// Maintain data state
let albumData: Album[] = [];

export const getAlbumData = async () => {
  if (albumData.length === 0) {
    albumData = await fetchAlbums() || [];
  }
  return albumData;
};

export const setAlbumData = (data: Album[]) => {
  albumData = data;
};

export const getAllAlbums = async () => {
  return await getAlbumData();
};

export const getAlbumById = async (id: string) => {
  const albums = await getAlbumData();
  return albums.find(album => album.id === id);
};

export const addAlbum = async (album: Omit<Album, "id">) => {
  const newAlbum: Album = {
    ...album,
    id: `album${albumData.length + 1}`
  };
  setAlbumData([...albumData, newAlbum]);
  await saveAlbum(newAlbum);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return newAlbum;
};

export const updateAlbum = async (id: string, data: Partial<Album>) => {
  const updatedAlbums = albumData.map(album => 
    album.id === id ? { ...album, ...data } : album
  );
  setAlbumData(updatedAlbums);
  const updatedAlbum = updatedAlbums.find(album => album.id === id);
  if (updatedAlbum) {
    await saveAlbum(updatedAlbum);
  }
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return updatedAlbum;
};

export const deleteAlbum = async (id: string) => {
  const updatedAlbums = albumData.filter(album => album.id !== id);
  setAlbumData(updatedAlbums);
  await deleteAlbumFromSupabase(id);
  
  // מחיקת כל המדבקות השייכות לאלבום זה
  const updatedStickers = stickerData.filter(sticker => sticker.albumId !== id);
  setStickerData(updatedStickers);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
};
