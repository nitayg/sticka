
import { getAllAlbums, getStickersByAlbumId, getStats } from '@/lib/data';
import { exchangeOffers } from '@/lib/initial-data';

// Album queries
export const fetchAllAlbums = () => {
  return getAllAlbums();
};

export const fetchAlbumStats = () => {
  return getStats();
};

// Sticker queries
export const fetchStickersByAlbumId = (albumId: string) => {
  if (!albumId) return [];
  return getStickersByAlbumId(albumId);
};

export const fetchStickersByFilter = (albumId: string, filter: string | null, filterType: 'range' | 'team') => {
  const stickers = getStickersByAlbumId(albumId);
  
  if (!filter) return stickers;
  
  if (filterType === 'range') {
    const [rangeStart, rangeEnd] = filter.split('-').map(Number);
    return stickers.filter(sticker => {
      // Handle string or number sticker numbers by converting to numeric value
      const numericValue = typeof sticker.number === 'string' 
        ? parseInt(sticker.number.replace(/\D/g, ''), 10) || 0
        : sticker.number;
      
      return numericValue >= rangeStart && numericValue <= rangeEnd;
    });
  }
  
  if (filterType === 'team') {
    return stickers.filter(sticker => sticker.team === filter);
  }
  
  return stickers;
};

// Exchange queries
export const fetchExchangeOffers = () => {
  return exchangeOffers;
};

export const fetchExchangeOffersByAlbum = (albumId: string) => {
  return exchangeOffers.filter(offer => offer.albumId === albumId);
};
