
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, ExchangeOffer, User } from './types';

const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWlsbWNzeWRrYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODM5OTEsImV4cCI6MjA1Njc1OTk5MX0.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Functions for albums
export async function fetchAlbums() {
  const { data, error } = await supabase.from('albums').select('*');
  if (error) {
    console.error('Error fetching albums:', error);
    return null;
  }
  return data as Album[];
}

export async function saveAlbum(album: Album) {
  const { data, error } = await supabase
    .from('albums')
    .upsert(album, { onConflict: 'id' });
  
  if (error) {
    console.error('Error saving album:', error);
    return false;
  }
  return true;
}

export async function deleteAlbumFromSupabase(id: string) {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting album:', error);
    return false;
  }
  return true;
}

// Functions for stickers
export async function fetchStickers() {
  const { data, error } = await supabase.from('stickers').select('*');
  if (error) {
    console.error('Error fetching stickers:', error);
    return null;
  }
  return data as Sticker[];
}

export async function saveSticker(sticker: Sticker) {
  const { data, error } = await supabase
    .from('stickers')
    .upsert(sticker, { onConflict: 'id' });
  
  if (error) {
    console.error('Error saving sticker:', error);
    return false;
  }
  return true;
}

export async function deleteStickerFromSupabase(id: string) {
  const { error } = await supabase
    .from('stickers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting sticker:', error);
    return false;
  }
  return true;
}

// Functions for exchange offers
export async function fetchExchangeOffers() {
  const { data, error } = await supabase.from('exchange_offers').select('*');
  if (error) {
    console.error('Error fetching exchange offers:', error);
    return null;
  }
  return data as ExchangeOffer[];
}

export async function saveExchangeOffer(offer: ExchangeOffer) {
  const { data, error } = await supabase
    .from('exchange_offers')
    .upsert(offer, { onConflict: 'id' });
  
  if (error) {
    console.error('Error saving exchange offer:', error);
    return false;
  }
  return true;
}

export async function deleteExchangeOfferFromSupabase(id: string) {
  const { error } = await supabase
    .from('exchange_offers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting exchange offer:', error);
    return false;
  }
  return true;
}

// Functions for users
export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  return data as User[];
}

export async function saveUser(user: User) {
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' });
  
  if (error) {
    console.error('Error saving user:', error);
    return false;
  }
  return true;
}

// Create or update multiple items in a transaction
export async function saveBatch<T extends {id: string}>(
  tableName: string, 
  items: T[]
) {
  if (!items.length) return true;
  
  const { error } = await supabase
    .from(tableName)
    .upsert(items, { onConflict: 'id' });
  
  if (error) {
    console.error(`Error saving batch to ${tableName}:`, error);
    return false;
  }
  return true;
}
