
import { albums, stickers, users, exchangeOffers } from './initial-data';
import { Album, Sticker, User, ExchangeOffer } from './types';

// Event names for storage events
const STORAGE_EVENTS = {
  ALBUMS: 'albums-updated',
  STICKERS: 'stickers-updated',
  USERS: 'users-updated',
  EXCHANGE_OFFERS: 'exchange-offers-updated'
};

// Initialize data from localStorage
export const initializeFromStorage = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }

    // Handle storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      
      switch(event.key) {
        case 'albums':
          if (event.newValue) {
            const newAlbums = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.ALBUMS, { detail: newAlbums }));
          }
          break;
        case 'stickers':
          if (event.newValue) {
            const newStickers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.STICKERS, { detail: newStickers }));
          }
          break;
        case 'users':
          if (event.newValue) {
            const newUsers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.USERS, { detail: newUsers }));
          }
          break;
        case 'exchangeOffers':
          if (event.newValue) {
            const newOffers = JSON.parse(event.newValue);
            window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.EXCHANGE_OFFERS, { detail: newOffers }));
          }
          break;
      }
    });
  } catch (error) {
    console.error('Error initializing from storage:', error);
  }
};

// Save data to localStorage with proper error handling
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return;
    }
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    
    // Dispatch a custom event to notify other components
    const eventName = key === 'albums' 
      ? STORAGE_EVENTS.ALBUMS 
      : key === 'stickers'
        ? STORAGE_EVENTS.STICKERS
        : key === 'users'
          ? STORAGE_EVENTS.USERS
          : STORAGE_EVENTS.EXCHANGE_OFFERS;
    
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Get data from localStorage with error handling
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('Storage not available - running in a non-browser environment');
      return defaultValue;
    }
    
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return defaultValue;
  }
};

// Export storage event names for use in components
export const StorageEvents = STORAGE_EVENTS;
