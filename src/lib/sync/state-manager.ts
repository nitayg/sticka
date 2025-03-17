
/**
 * State Manager
 * אחראי על ניהול מצב האפליקציה והעברת הודעות בין קומפוננטות
 */
import { StorageEvents } from './constants';
import { setMemoryStorage, getFromStorage } from './storage-utils';
import { pushToCloud } from './sync-client';
import type { Album, Sticker, User, ExchangeOffer } from '../types';

/**
 * מעדכן את נתוני האלבומים במצב האפליקציה
 */
export const setAlbumData = (albums: Album[]) => {
  // שמירת הנתונים בזיכרון המקומי
  setMemoryStorage('albums', albums);
  
  // פרסום אירוע עדכון
  window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: albums }));
  
  // סנכרון לענן
  pushToCloud('albums', albums).catch(error => {
    console.error('Failed to push albums to cloud:', error);
  });
  
  return albums;
};

/**
 * מעדכן את נתוני המדבקות במצב האפליקציה
 */
export const setStickerData = (stickers: Sticker[]) => {
  // שמירת הנתונים בזיכרון המקומי
  setMemoryStorage('stickers', stickers);
  
  // פרסום אירוע עדכון
  window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: stickers }));
  
  // סנכרון לענן
  pushToCloud('stickers', stickers).catch(error => {
    console.error('Failed to push stickers to cloud:', error);
  });
  
  // פרסום אירועים נוספים
  window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
    detail: { action: 'save', count: stickers.length } 
  }));
  
  return stickers;
};

/**
 * מעדכן את נתוני המשתמשים במצב האפליקציה
 */
export const setUserData = (users: User[]) => {
  // שמירת הנתונים בזיכרון המקומי
  setMemoryStorage('users', users);
  
  // פרסום אירוע עדכון
  window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: users }));
  
  // סנכרון לענן
  pushToCloud('users', users).catch(error => {
    console.error('Failed to push users to cloud:', error);
  });
  
  return users;
};

/**
 * מעדכן את נתוני הצעות ההחלפה במצב האפליקציה
 */
export const setExchangeOfferData = (offers: ExchangeOffer[]) => {
  // שמירת הנתונים בזיכרון המקומי
  setMemoryStorage('exchangeOffers', offers);
  
  // פרסום אירוע עדכון
  window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: offers }));
  
  // פרסום אירוע נוסף
  window.dispatchEvent(new CustomEvent('exchangeOffersDataChanged', { detail: offers }));
  
  // סנכרון לענן
  pushToCloud('exchangeOffers', offers).catch(error => {
    console.error('Failed to push exchange offers to cloud:', error);
  });
  
  return offers;
};

/**
 * מקבל את נתוני האלבומים העדכניים
 */
export const getAlbumData = () => {
  return getFromStorage<Album[]>('albums', []);
};

/**
 * מקבל את נתוני המדבקות העדכניים
 */
export const getStickerData = () => {
  return getFromStorage<Sticker[]>('stickers', []);
};

/**
 * מקבל את נתוני המשתמשים העדכניים
 */
export const getUserData = () => {
  return getFromStorage<User[]>('users', []);
};

/**
 * מקבל את נתוני הצעות ההחלפה העדכניים
 */
export const getExchangeOfferData = () => {
  return getFromStorage<ExchangeOffer[]>('exchangeOffers', []);
};
