// sticker-operations.ts
import { supabase } from './supabase-client'; // ודא שהנתיב נכון
import { Sticker } from './types';

// שליפת כל המדבקות (אפשר לסנן לפי אלבום)
export async function getStickers(albumId?: string): Promise<Sticker[]> {
  let query = supabase.from('stickers').select('*');
  if (albumId) {
    query = query.eq('album_id', albumId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching stickers:', error);
    throw error;
  }
  return data as Sticker[];
}

// שליפת מדבקה לפי מזהה
export async function getStickerById(stickerId: string): Promise<Sticker | null> {
  const { data, error } = await supabase
    .from('stickers')
    .select('*')
    .eq('id', stickerId)
    .single();
  if (error) {
    console.error('Error fetching sticker:', error);
    throw error;
  }
  return data as Sticker;
}

// יצירת מדבקה חדשה
export async function createSticker(sticker: Omit<Sticker, 'id'>): Promise<Sticker> {
  const { data, error } = await supabase
    .from('stickers')
    .insert(sticker)
    .single();
  if (error) {
    console.error('Error creating sticker:', error);
    throw error;
  }
  return data as Sticker;
}

// עדכון מדבקה קיימת
export async function updateSticker(stickerId: string, updates: Partial<Sticker>): Promise<Sticker> {
  const { data, error } = await supabase
    .from('stickers')
    .update(updates)
    .eq('id', stickerId)
    .single();
  if (error) {
    console.error('Error updating sticker:', error);
    throw error;
  }
  return data as Sticker;
}

// מחיקת מדבקה
export async function deleteSticker(stickerId: string): Promise<void> {
  const { error } = await supabase
    .from('stickers')
    .delete()
    .eq('id', stickerId);
  if (error) {
    console.error('Error deleting sticker:', error);
    throw error;
  }
}
