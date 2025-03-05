
import { Album, Sticker, User, ExchangeOffer } from './types';

export const albums: Album[] = [];

export const stickers: Sticker[] = [];

export const users: User[] = [
  {
    id: "u1",
    name: "אלכס כהן",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    stickerCount: {
      total: 0,
      owned: 0,
      needed: 0,
      duplicates: 0
    }
  }
];

export const exchangeOffers: ExchangeOffer[] = [];
