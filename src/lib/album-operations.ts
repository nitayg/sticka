
import { Album } from './types';
import { albums as initialAlbums } from './initial-data';
import { stickerData, setStickerData } from './sticker-operations';
import { saveToStorage, getFromStorage } from './sync-manager';

// Maintain data state
let albumData = [...initialAlbums];

// Add recycle bin state
let recycledAlbums: Album[] = [];

// Initialize recycled albums from localStorage if exists
try {
  recycledAlbums = getFromStorage<Album[]>('recycledAlbums', []);
} catch (error) {
  console.error('Error loading recycled albums:', error);
  recycledAlbums = [];
}

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

export const deleteAlbum = (id: string, moveToRecycleBin: boolean = true) => {
  // מצא את האלבום שרוצים למחוק
  const albumToDelete = albumData.find(album => album.id === id);
  
  if (!albumToDelete) {
    return false;
  }
  
  // אם נדרש להעביר לסל המיחזור
  if (moveToRecycleBin) {
    // הוסף את האלבום לסל המיחזור
    recycledAlbums = [...recycledAlbums, albumToDelete];
    // שמור את סל המיחזור ב-localStorage
    saveToStorage('recycledAlbums', recycledAlbums);
  }
  
  // הסר את האלבום מרשימת האלבומים
  setAlbumData(albumData.filter(album => album.id !== id));
  
  // מחק את כל המדבקות השייכות לאלבום זה
  if (!moveToRecycleBin) {
    // אם מחיקה מוחלטת, מחק גם את המדבקות
    const updatedStickers = stickerData.filter(sticker => sticker.albumId !== id);
    setStickerData(updatedStickers);
  }
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return true;
};

// פונקציות חדשות לטיפול בסל המיחזור
export const getRecycledAlbums = () => {
  return recycledAlbums;
};

export const restoreAlbum = (id: string) => {
  // מצא את האלבום בסל המיחזור
  const albumToRestore = recycledAlbums.find(album => album.id === id);
  
  if (!albumToRestore) {
    return false;
  }
  
  // הוסף את האלבום חזרה לרשימת האלבומים
  setAlbumData([...albumData, albumToRestore]);
  
  // הסר את האלבום מסל המיחזור
  recycledAlbums = recycledAlbums.filter(album => album.id !== id);
  saveToStorage('recycledAlbums', recycledAlbums);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return true;
};

export const permanentlyDeleteAlbum = (id: string) => {
  // הסר את האלבום מסל המיחזור
  recycledAlbums = recycledAlbums.filter(album => album.id !== id);
  saveToStorage('recycledAlbums', recycledAlbums);
  
  // מחק את כל המדבקות השייכות לאלבום זה
  const updatedStickers = stickerData.filter(sticker => sticker.albumId !== id);
  setStickerData(updatedStickers);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return true;
};

export const clearRecycleBin = () => {
  // שמור את ה-IDs של האלבומים בסל המיחזור
  const recycledAlbumIds = recycledAlbums.map(album => album.id);
  
  // מחק את כל המדבקות השייכות לאלבומים בסל המיחזור
  const updatedStickers = stickerData.filter(sticker => !recycledAlbumIds.includes(sticker.albumId));
  setStickerData(updatedStickers);
  
  // נקה את סל המיחזור
  recycledAlbums = [];
  saveToStorage('recycledAlbums', recycledAlbums);
  
  // Trigger a custom event to notify components that album data has changed
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  
  return true;
};
