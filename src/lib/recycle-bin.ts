
import { Album, Sticker } from './types';
import { albums as initialAlbums } from './initial-data';
import { saveToStorage, getFromStorage } from './sync-manager';
import { setAlbumData, getAlbumData } from './album-operations';
import { stickerData, setStickerData } from './sticker-operations';

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
  const relatedStickers = stickerData.filter(sticker => sticker.albumId === albumId);
  
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
  setAlbumData(albums.filter(album => album.id !== albumId));
  setStickerData(stickerData.filter(sticker => sticker.albumId !== albumId));
  
  // הפעל אירוע מותאם אישית כדי להודיע לרכיבים שנתוני האלבום השתנו
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};

// מחק אלבום לצמיתות מסל המיחזור
export const deleteAlbumPermanently = (albumId: string): void => {
  const recycleBin = getRecycleBin();
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
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
  setAlbumData([...albums, itemToRestore.item]);
  
  const stickers = stickerData;
  setStickerData([...stickers, ...itemToRestore.relatedStickers]);
  
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
