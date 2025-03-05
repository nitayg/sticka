
import { Album, Sticker, User, ExchangeOffer } from './types';

// Initialize data from localStorage or use empty arrays as defaults
export const albums: Album[] = JSON.parse(localStorage.getItem('albums') || '[]');

export const stickers: Sticker[] = JSON.parse(localStorage.getItem('stickers') || '[]');

export const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

export const exchangeOffers: ExchangeOffer[] = JSON.parse(localStorage.getItem('exchangeOffers') || '[]');
