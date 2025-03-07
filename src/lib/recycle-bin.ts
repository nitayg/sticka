
import { Album, Sticker } from './types';
import { albums as initialAlbums } from './initial-data';
import { saveToStorage, getFromStorage, syncWithSupabase } from './sync-manager';
import { setAlbumData, getAlbumData } from './album-operations';
import { stickerData, setStickerData } from './sticker-operations';
import { saveAlbum, saveSticker, saveBatch } from './supabase';

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
  // וסמן אותם כנמחקים ברמת הנתונים
  const updatedAlbums = albums.map(album => 
    album.id === albumId ? { ...album, isDeleted: true, lastModified: Date.now() } : album
  );
  setAlbumData(updatedAlbums);
  
  const updatedStickers = stickerData.map(sticker => 
    sticker.albumId === albumId ? { ...sticker, isDeleted: true, lastModified: Date.now() } : sticker
  );
  setStickerData(updatedStickers);
  
  // שליחת עדכון מחיקה רכה גם לשרת
  const albumWithSoftDelete = { ...albumToDelete, isDeleted: true, lastModified: Date.now() };
  saveAlbum(albumWithSoftDelete);
  
  // עדכון מחיקה רכה של כל המדבקות הקשורות
  const updatedRelatedStickers = relatedStickers.map(sticker => ({
    ...sticker,
    isDeleted: true,
    lastModified: Date.now()
  }));
  
  // שמירת המדבקות שנמחקו בצורה רכה לשרת
  if (updatedRelatedStickers.length > 0) {
    saveBatch('stickers', updatedRelatedStickers);
  }
  
  // הפעל אירוע מותאם אישית כדי להודיע לרכיבים שנתוני האלבום השתנו
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
  
  // כפיית סנכרון מיידי עם השרת
  syncWithSupabase();
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
  // והסר את סימון המחיקה
  const restoredAlbum = {
    ...itemToRestore.item,
    isDeleted: false,
    lastModified: Date.now()
  };
  
  const albums = getAlbumData();
  setAlbumData([...albums, restoredAlbum]);
  
  // שחזר את כל המדבקות הקשורות
  const restoredStickers = itemToRestore.relatedStickers.map(sticker => ({
    ...sticker,
    isDeleted: false,
    lastModified: Date.now()
  }));
  
  const stickers = stickerData;
  setStickerData([...stickers, ...restoredStickers]);
  
  // שליחת עדכוני שחזור לשרת
  saveAlbum(restoredAlbum);
  if (restoredStickers.length > 0) {
    saveBatch('stickers', restoredStickers);
  }
  
  // הסר את הפריט מסל המיחזור
  const updatedRecycleBin = recycleBin.filter(item => item.id !== albumId);
  saveRecycleBin(updatedRecycleBin);
  
  // הפעל אירועים מותאמים אישית כדי להודיע לרכיבים שהנתונים השתנו
  window.dispatchEvent(new CustomEvent('albumDataChanged'));
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
  
  // כפיית סנכרון מיידי עם השרת
  syncWithSupabase();
};

// נקה את סל המיחזור
export const emptyRecycleBin = (): void => {
  saveRecycleBin([]);
  window.dispatchEvent(new CustomEvent('recycleBinChanged'));
};
