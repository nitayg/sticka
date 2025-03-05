
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, User, ExchangeOffer } from './types';

// יצירת לקוח Supabase
export const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWlsbWNzeWRrYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODM5OTEsImV4cCI6MjA1Njc1OTk5MX0.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA'; 

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
