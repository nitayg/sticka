
import { Album, Sticker, User, ExchangeOffer } from './types';
import { getFromStorage } from './sync';

// Initialize data from localStorage or use empty arrays as defaults
export const albums: Album[] = getFromStorage<Album[]>('albums', []);

export const stickers: Sticker[] = getFromStorage<Sticker[]>('stickers', []);

export const users: User[] = getFromStorage<User[]>('users', []);

export const exchangeOffers: ExchangeOffer[] = getFromStorage<ExchangeOffer[]>('exchangeOffers', []);
