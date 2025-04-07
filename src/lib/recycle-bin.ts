
import { Album, Sticker } from './types';
import { albums as initialAlbums } from './initial-data';
import { saveToStorage, getFromStorage } from './sync';
import { setAlbumData, getAlbumData } from './album-operations';
import { getStickerData, setStickerData } from './sticker-operations';

// RecycledItem type definition
export type RecycledItem = {
  id: string;
  item: Album;
  relatedStickers: Sticker[];
  deletedAt: number;
};

// Get the recycle bin from storage or create a new one if it doesn't exist
export const getRecycleBin = (): RecycledItem[] => {
  return getFromStorage<RecycledItem[]>('recycleBin', []);
};

// Save the recycle bin to storage
export const saveRecycleBin = (recycleBin: RecycledItem[]): void => {
  saveToStorage('recycleBin', recycleBin);
};

// Move an album to the recycle bin and delete it from active data
export const moveAlbumToRecycleBin = (albumId: string): void => {
  // Find the album to move to the recycle bin
  const albums = getAlbumData();
  const albumToDelete = albums.find(album => album.id === albumId);
  
  if (!albumToDelete) {
    console.error('Album not found:', albumId);
    return;
  }
  
  // Find all stickers related to this album
  const stickers = getStickerData();
  const relatedStickers = stickers.filter(sticker => sticker.albumId === albumId);
  
  // Add the album and its stickers to the recycle bin
  const recycleBin = getRecycleBin();
  recycleBin.push({
    id: albumId,
    item: albumToDelete,
    relatedStickers,
    deletedAt: Date.now()
  });
  saveRecycleBin(recycleBin);
  
  // Remove the album and its stickers from active data
  // but mark them as deleted instead of completely removing them
  setAlbumData(albums.map(album => 
    album.id === albumId 
      ? { ...album, isDeleted: true, lastModified: Date.now() } 
      : album
  ));
  
  setStickerData(stickers.map(sticker => 
    sticker.albumId === albumId 
      ? { ...sticker, isDeleted: true, lastModified: Date.now() } 
      : sticker
  ));
  
  // Dispatch a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};

// Permanently delete an album from the recycle bin
export const deleteAlbumPermanently = (albumId: string): void => {
  const recycleBin = getRecycleBin();
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  // Make sure the album is actually deleted from album data
  const albums = getAlbumData();
  const albumToDelete = albums.find(album => album.id === albumId);
  
  if (albumToDelete) {
    // Completely remove the album from the system
    setAlbumData(albums.filter(album => album.id !== albumId));
    setStickerData(getStickerData().filter(sticker => sticker.albumId !== albumId));
  }
  
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
};

// Restore an album from the recycle bin
export const restoreAlbumFromRecycleBin = (albumId: string): void => {
  const recycleBin = getRecycleBin();
  const itemToRestore = recycleBin.find(item => item.id === albumId);
  
  if (!itemToRestore) {
    console.error('Item not found in recycle bin:', albumId);
    return;
  }
  
  // Restore the album and its stickers to active data
  const albums = getAlbumData();
  const restoredAlbum = { 
    ...itemToRestore.item, 
    isDeleted: false, 
    lastModified: Date.now() 
  };
  
  // Check if the album exists in the system (in a deleted state)
  const existingAlbumIndex = albums.findIndex(album => album.id === albumId);
  
  if (existingAlbumIndex >= 0) {
    // If the album exists, update its status
    const updatedAlbums = [...albums];
    updatedAlbums[existingAlbumIndex] = restoredAlbum;
    setAlbumData(updatedAlbums);
  } else {
    // If the album doesn't exist, add it back
    setAlbumData([...albums, restoredAlbum]);
  }
  
  // Restore the stickers
  const stickers = getStickerData();
  const restoredStickers = itemToRestore.relatedStickers.map(sticker => ({
    ...sticker,
    isDeleted: false,
    lastModified: Date.now()
  }));
  
  // Add the restored stickers
  const newStickers = [...stickers];
  
  for (const restoredSticker of restoredStickers) {
    const existingStickerIndex = newStickers.findIndex(s => s.id === restoredSticker.id);
    
    if (existingStickerIndex >= 0) {
      // If the sticker exists, update its status
      newStickers[existingStickerIndex] = restoredSticker;
    } else {
      // If the sticker doesn't exist, add it
      newStickers.push(restoredSticker);
    }
  }
  
  setStickerData(newStickers);
  
  // Remove the item from the recycle bin
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  // Dispatch custom events to notify components that data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};

// Empty the recycle bin
export const emptyRecycleBin = (): void => {
  saveRecycleBin([]);
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};
