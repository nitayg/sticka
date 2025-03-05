
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, User, ExchangeOffer } from './types';

// יצירת לקוח Supabase
export const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
export const supabaseKey = ''; // תצטרך למלא את ה-anon key (public) כאן

export const supabase = createClient(supabaseUrl, supabaseKey);

// טיפוסים עבור הטבלאות ב-Supabase
export type Tables = {
  albums: Album;
  stickers: Sticker;
  users: User;
  exchange_offers: ExchangeOffer;
}

// פונקציה לבדיקת חיבור
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('albums').select('count');
    if (error) throw error;
    console.log('חיבור Supabase נוצר בהצלחה!', data);
    return true;
  } catch (error) {
    console.error('שגיאה בחיבור ל-Supabase:', error);
    return false;
  }
};
