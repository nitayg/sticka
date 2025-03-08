
import { supabase } from './client';
import { Album, isAlbum } from '../types';
import { saveBatch } from './batch-operations';

export async function fetchAlbums() {
  console.log('Fetching albums from Supabase...');
  const { data, error } = await supabase.from('albums').select('*');
  if (error) {
    console.error('Error fetching albums:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} albums from Supabase`);
  console.log('Fetched data:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק Album
  const adjustedData = data.map((album) => ({
    id: album.id,
    name: album.name,
    totalStickers: album.totalstickers,
    description: album.description,
    year: album.year,
    coverImage: album.coverimage,
    lastModified: album.lastmodified || Date.now(), // Ensure lastModified has a value
    isDeleted: album.isdeleted || false
  }));

  console.log('Adjusted data:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as Album[];
}

export async function saveAlbum(album: Album) {
  console.log('Saving album to Supabase:', album.id);
  const supabaseAlbum = {
    id: album.id,
    name: album.name,
    totalstickers: album.totalStickers,
    description: album.description,
    year: album.year,
    coverimage: album.coverImage,
    lastmodified: album.lastModified || Date.now(), // Ensure lastModified has a value
    isdeleted: album.isDeleted || false
  };
  console.log('JSON שנשלח:', JSON.stringify(supabaseAlbum, null, 2));
  const { data, error } = await supabase
    .from('albums')
    .upsert(supabaseAlbum, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('Error saving album:', error);
    return false;
  }
  return true;
}

export async function deleteAlbumFromSupabase(id: string) {
  console.log('Deleting album from Supabase:', id);
  
  // Hard delete from Supabase
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting album from Supabase:', error);
    return false;
  }
  
  // Verify deletion was successful by trying to fetch the album
  const { data } = await supabase
    .from('albums')
    .select('*')
    .eq('id', id);
    
  if (data && data.length > 0) {
    console.error('Album still exists after deletion attempt', data);
    return false;
  }
  
  console.log('Album deleted successfully from Supabase.');
  return true;
}

export async function saveAlbumBatch(albums: Album[]) {
  if (!albums.length) return true;
  
  console.log(`Saving ${albums.length} albums to Supabase`);
  
  const adjustedItems = albums.map((album) => ({
    id: album.id,
    name: album.name,
    totalstickers: album.totalStickers,
    description: album.description,
    year: album.year,
    coverimage: album.coverImage,
    lastmodified: album.lastModified || Date.now(), // Ensure lastModified has a value
    isdeleted: album.isDeleted || false
  }));
  
  return await saveBatch('albums', adjustedItems);
}
