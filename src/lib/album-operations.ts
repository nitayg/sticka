
import { Album } from './types';
import { albums as initialAlbums } from './initial-data';
import { stickerData, setStickerData } from './sticker-operations';

// Maintain data state
let albumData = [...initialAlbums];

export const getAlbumData = () => albumData;
export const setAlbumData = (data: Album[]) => {
  albumData = data;
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
  return newAlbum;
};

export const updateAlbum = (id: string, data: Partial<Album>) => {
  setAlbumData(albumData.map(album => 
    album.id === id ? { ...album, ...data } : album
  ));
  return albumData.find(album => album.id === id);
};

export const deleteAlbum = (id: string) => {
  setAlbumData(albumData.filter(album => album.id !== id));
  // מחיקת כל המדבקות השייכות לאלבום זה
  setStickerData(stickerData.filter(sticker => sticker.albumId !== id));
};
