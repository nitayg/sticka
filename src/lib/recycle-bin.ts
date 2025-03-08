
import { Album, Sticker } from './types';
import { albums as initialAlbums } from './initial-data';
import { saveToStorage, getFromStorage } from './sync';
import { setAlbumData, getAlbumData } from './album-operations';
import { getStickerData, setStickerData } from './sticker-operations';

// נשמור אלבומים שנמחקו בסל המיחזור
export type RecycledItem = {
  id: string;
  item: Album;
  relatedStickers: Sticker[];
  deletedAt: number;
};

// קבל את סל המיחזור מהאחסון או צור חדש אם אינו קיים
export const getRecycleBin = (): RecycledItem[] => {
  return getFromStorage<RecycledItem[]>('recycleBin', []);
};

// שמור את סל המיחזור באחסון
export const saveRecycleBin = (recycleBin: RecycledItem[]): void => {
  saveToStorage('recycleBin', recycleBin);
};

// העבר אלבום לסל המיחזור ומחק אותו מהנתונים הפעילים
export const moveAlbumToRecycleBin = (albumId: string): void => {
  // מצא את האלבום שצריך להעביר לסל המיחזור
  const albums = getAlbumData();
  const albumToDelete = albums.find(album => album.id === albumId);
  
  if (!albumToDelete) {
    console.error('האלבום לא נמצא:', albumId);
    return;
  }
  
  // מצא את כל המדבקות הקשורות לאלבום זה
  const stickers = getStickerData();
  const relatedStickers = stickers.filter(sticker => sticker.albumId === albumId);
  
  // הוסף את האלבום והמדבקות שלו לסל המיחזור
  const recycleBin = getRecycleBin();
  recycleBin.push({
    id: albumId,
    item: albumToDelete,
    relatedStickers,
    deletedAt: Date.now()
  });
  saveRecycleBin(recycleBin);
  
  // הסר את האלבום והמדבקות שלו מהנתונים הפעילים
  // אבל סמן אותם כמחוקים במקום למחוק לגמרי
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
  
  // הפעל אירוע מותאם אישית כדי להודיע לרכיבים שנתוני האלבום השתנו
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};

// מחק אלבום לצמיתות מסל המיחזור
export const deleteAlbumPermanently = (albumId: string): void => {
  const recycleBin = getRecycleBin();
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  // וודא שהאלבום באמת נמחק מנתוני האלבומים
  const albums = getAlbumData();
  const albumToDelete = albums.find(album => album.id === albumId);
  
  if (albumToDelete) {
    // מחק לגמרי את האלבום מהמערכת
    setAlbumData(albums.filter(album => album.id !== albumId));
    setStickerData(getStickerData().filter(sticker => sticker.albumId !== albumId));
  }
  
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
};

// שחזר אלבום מסל המיחזור
export const restoreAlbumFromRecycleBin = (albumId: string): void => {
  const recycleBin = getRecycleBin();
  const itemToRestore = recycleBin.find(item => item.id === albumId);
  
  if (!itemToRestore) {
    console.error('פריט לא נמצא בסל המיחזור:', albumId);
    return;
  }
  
  // שחזר את האלבום והמדבקות שלו לנתונים הפעילים
  const albums = getAlbumData();
  const restoredAlbum = { 
    ...itemToRestore.item, 
    isDeleted: false, 
    lastModified: Date.now() 
  };
  
  // בדוק אם האלבום קיים במערכת (במצב מחוק)
  const existingAlbumIndex = albums.findIndex(album => album.id === albumId);
  
  if (existingAlbumIndex >= 0) {
    // אם האלבום קיים, עדכן את הסטטוס שלו
    const updatedAlbums = [...albums];
    updatedAlbums[existingAlbumIndex] = restoredAlbum;
    setAlbumData(updatedAlbums);
  } else {
    // אם האלבום לא קיים, הוסף אותו מחדש
    setAlbumData([...albums, restoredAlbum]);
  }
  
  // שחזר את המדבקות
  const stickers = getStickerData();
  const restoredStickers = itemToRestore.relatedStickers.map(sticker => ({
    ...sticker,
    isDeleted: false,
    lastModified: Date.now()
  }));
  
  // הוסף את המדבקות המשוחזרות
  const newStickers = [...stickers];
  
  for (const restoredSticker of restoredStickers) {
    const existingStickerIndex = newStickers.findIndex(s => s.id === restoredSticker.id);
    
    if (existingStickerIndex >= 0) {
      // אם המדבקה קיימת, עדכן את הסטטוס שלה
      newStickers[existingStickerIndex] = restoredSticker;
    } else {
      // אם המדבקה לא קיימת, הוסף אותה
      newStickers.push(restoredSticker);
    }
  }
  
  setStickerData(newStickers);
  
  // הסר את הפריט מסל המיחזור
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  // הפעל אירועים מותאמים אישית כדי להודיע לרכיבים שהנתונים השתנו
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};

// נקה את סל המיחזור
export const emptyRecycleBin = (): void => {
  saveRecycleBin([]);
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};
