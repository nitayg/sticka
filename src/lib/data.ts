
// Export types
export * from './types';

// Export data
export { 
  albums, 
  stickers, 
  users, 
  exchangeOffers 
} from './initial-data';

// Export album operations
export {
  getAllAlbums,
  getAlbumById,
  addAlbum,
  updateAlbum,
  deleteAlbum
} from './album-operations';

// Export sticker operations
export {
  getStickersByAlbumId,
  addSticker,
  updateSticker,
  deleteSticker,
  toggleStickerOwned,
  toggleStickerDuplicate,
  importStickersFromCSV,
  getStats,
  addStickersToInventory,
  getStickerData,
  setStickerData
} from './sticker-operations';

// Export recycle bin operations
export {
  getRecycleBin,
  moveAlbumToRecycleBin,
  restoreAlbumFromRecycleBin,
  deleteAlbumPermanently,
  emptyRecycleBin
} from './recycle-bin';

// Export Supabase functions
export {
  initializeFromStorage,
  syncWithSupabase,
  StorageEvents
} from './sync';

// Re-export additional dependencies you might need
export * from './utils';
export * from './supabase';
export * from './sticker-utils';
