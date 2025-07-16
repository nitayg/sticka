
// Re-export the client
export { supabase } from './client';
export type { Database } from './types';

// Re-export album operations
export {
  fetchAlbums,
  saveAlbum,
  deleteAlbumFromSupabase,
  saveAlbumBatch
} from './albums';

// Re-export sticker operations
export {
  fetchStickers,
  saveSticker,
  deleteStickerFromSupabase,
  saveStickerBatch
} from './stickers';

// Re-export user operations
export {
  fetchUsers,
  saveUser,
  saveUserBatch
} from './users';

// Re-export exchange offer operations
export {
  fetchExchangeOffers,
  saveExchangeOffer,
  deleteExchangeOfferFromSupabase,
  saveExchangeOfferBatch
} from './exchange-offers';

// Re-export batch operations
export { saveBatch } from './batch-operations';
