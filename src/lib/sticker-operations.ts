
import { Sticker } from './types';
import { stickers as initialStickers } from './initial-data';

// Maintain data state
export let stickerData = [...initialStickers];

export const setStickerData = (data: Sticker[]) => {
  stickerData = data;
};

export const getStickersByAlbumId = (albumId: string) => {
  return stickerData.filter(sticker => sticker.albumId === albumId);
};

export const addSticker = (sticker: Omit<Sticker, "id">) => {
  const newSticker = {
    ...sticker,
    id: `sticker${stickerData.length + 1}`
  };
  setStickerData([...stickerData, newSticker]);
  return newSticker;
};

export const updateSticker = (id: string, data: Partial<Sticker>) => {
  setStickerData(stickerData.map(sticker => 
    sticker.id === id ? { ...sticker, ...data } : sticker
  ));
  return stickerData.find(sticker => sticker.id === id);
};

export const deleteSticker = (id: string) => {
  setStickerData(stickerData.filter(sticker => sticker.id !== id));
};

export const toggleStickerOwned = (id: string) => {
  return updateSticker(id, { 
    isOwned: !stickerData.find(s => s.id === id)?.isOwned 
  });
};

export const toggleStickerDuplicate = (id: string) => {
  return updateSticker(id, { 
    isDuplicate: !stickerData.find(s => s.id === id)?.isDuplicate 
  });
};

export const importStickersFromCSV = (albumId: string, csvData: Array<[number, string, string]>) => {
  const newStickers = csvData.map(([number, name, team], index) => ({
    id: `sticker${stickerData.length + index + 1}`,
    number,
    name,
    team,
    category: "שחקנים", // ברירת מחדל
    isOwned: false,
    isDuplicate: false,
    albumId
  }));
  
  setStickerData([...stickerData, ...newStickers]);
  return newStickers;
};

export const getStats = (albumId?: string) => {
  const filteredStickers = albumId 
    ? stickerData.filter(s => s.albumId === albumId)
    : stickerData;
    
  return {
    total: filteredStickers.length,
    owned: filteredStickers.filter(s => s.isOwned).length,
    needed: filteredStickers.filter(s => !s.isOwned).length,
    duplicates: filteredStickers.filter(s => s.isDuplicate).length
  };
};
