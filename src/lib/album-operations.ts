// album-operations.ts
import { supabase } from './supabase-client'; // ודא שהנתיב נכון
import { Album } from './types'; // או הנתיב בו מוגדרים האינטרפייסים

// שליפת כל האלבומים
export async function getAlbums(): Promise<Album[]> {
  const { data, error } = await supabase.from('albums').select('*');
  if (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
  return data as Album[];
}

// שליפת אלבום לפי מזהה
export async function getAlbumById(albumId: string): Promise<Album | null> {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .single();
  if (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
  return data as Album;
}

// יצירת אלבום חדש
export async function createAlbum(album: Omit<Album, 'id'>): Promise<Album> {
  const { data, error } = await supabase
    .from('albums')
    .insert(album)
    .single();
  if (error) {
    console.error('Error creating album:', error);
    throw error;
  }
  return data as Album;
}

// עדכון אלבום קיים
export async function updateAlbum(albumId: string, updates: Partial<Album>): Promise<Album> {
  const { data, error } = await supabase
    .from('albums')
    .update(updates)
    .eq('id', albumId)
    .single();
  if (error) {
    console.error('Error updating album:', error);
    throw error;
  }
  return data as Album;
}

// מחיקת אלבום
export async function deleteAlbum(albumId: string): Promise<void> {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId);
  if (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
}
