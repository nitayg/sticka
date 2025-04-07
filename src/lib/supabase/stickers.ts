
import { supabase } from './client';
import { Sticker, isSticker } from '../types';
import { saveBatch } from './batch-operations';

export async function fetchStickers() {
  console.warn('DEPRECATED: fetchStickers() is loading all stickers at once which causes high egress');
  console.warn('Consider using fetchStickersByAlbumId() instead to reduce egress');
  
  console.log('Fetching stickers from Supabase...');
  const { data, error } = await supabase.from('stickers').select('*');
  if (error) {
    console.error('Error fetching stickers:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} stickers from Supabase`);
  
  // Adjust data to the Sticker interface
  const adjustedData = data.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamLogo: sticker.teamlogo,
    category: sticker.category,
    imageUrl: sticker.imageurl,
    number: sticker.number, // Now this properly handles both numeric and string values
    isOwned: sticker.isowned,
    isDuplicate: sticker.isduplicate,
    duplicateCount: sticker.duplicatecount,
    albumId: sticker.albumid,
  }));

  return adjustedData as Sticker[];
}

// IMPROVED: Fetch stickers only for a specific album
export async function fetchStickersByAlbumId(albumId: string) {
  if (!albumId) {
    console.error('No albumId provided to fetchStickersByAlbumId');
    return [];
  }
  
  console.log(`Fetching stickers for album ${albumId} from Supabase`);
  
  // Optimize query to only select fields we need
  const { data, error } = await supabase
    .from('stickers')
    .select('id, name, team, teamlogo, category, number, isowned, isduplicate, duplicatecount, albumid')
    .eq('albumid', albumId)
    .order('number');
    
  if (error) {
    console.error(`Error fetching stickers for album ${albumId}:`, error);
    return [];
  }
  
  console.log(`Fetched ${data?.length || 0} stickers for album ${albumId}`);
  
  // Adjust data to the Sticker interface
  const adjustedData = data.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamLogo: sticker.teamlogo,
    category: sticker.category,
    imageUrl: '', // Don't load imageUrl by default to reduce data transfer
    number: sticker.number,
    isOwned: sticker.isowned,
    isDuplicate: sticker.isduplicate,
    duplicateCount: sticker.duplicatecount,
    albumId: sticker.albumid,
  }));

  return adjustedData as Sticker[];
}

// Lazily fetch image URLs only when needed for specific stickers
export async function fetchStickerImages(stickerIds: string[]) {
  if (!stickerIds.length) return {};
  
  console.log(`Fetching image URLs for ${stickerIds.length} stickers`);
  
  const { data, error } = await supabase
    .from('stickers')
    .select('id, imageurl')
    .in('id', stickerIds);
    
  if (error) {
    console.error('Error fetching sticker images:', error);
    return {};
  }
  
  // Create a map of id -> imageUrl
  const imageMap: Record<string, string> = {};
  data.forEach(sticker => {
    imageMap[sticker.id] = sticker.imageurl;
  });
  
  return imageMap;
}

export async function saveSticker(sticker: Sticker) {
  console.log('Saving sticker to Supabase:', sticker.id, 'with number:', sticker.number, 'type:', typeof sticker.number);
  const supabaseSticker = {
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamlogo: sticker.teamLogo,
    category: sticker.category,
    imageurl: sticker.imageUrl,
    number: sticker.number, // Now this properly handles both numeric and string values
    isowned: sticker.isOwned,
    isduplicate: sticker.isDuplicate,
    duplicatecount: sticker.duplicateCount,
    albumid: sticker.albumId,
  };
  
  const { data, error } = await supabase
    .from('stickers')
    .upsert(supabaseSticker, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('Error saving sticker:', error);
    return false;
  }
  return true;
}

export async function deleteStickerFromSupabase(id: string) {
  console.log('Deleting sticker from Supabase:', id);
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

export async function saveStickerBatch(stickers: Sticker[]) {
  if (!stickers.length) return true;
  
  console.log(`Saving ${stickers.length} stickers to Supabase`);
  
  // Log critical range and alphanumeric stickers
  const criticalRangeStickers = stickers.filter(s => 
    typeof s.number === 'number' && s.number >= 426 && s.number <= 440
  );
  
  const alphanumericStickers = stickers.filter(s => 
    typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
  );
  
  if (criticalRangeStickers.length > 0) {
    console.log(`Batch contains ${criticalRangeStickers.length} critical range stickers:`, 
      criticalRangeStickers.map(s => ({id: s.id, number: s.number, name: s.name})));
  }
  
  if (alphanumericStickers.length > 0) {
    console.log(`Batch contains ${alphanumericStickers.length} alphanumeric stickers:`, 
      alphanumericStickers.map(s => ({id: s.id, number: s.number, name: s.name})));
  }
  
  const adjustedItems = stickers.map((sticker) => {
    // Debug each sticker before saving
    if ((typeof sticker.number === 'number' && sticker.number >= 426 && sticker.number <= 440) ||
        (typeof sticker.number === 'string' && /^[A-Za-z]/.test(sticker.number.toString()))) {
      console.log(`Preparing special sticker for save: #${sticker.number} (${typeof sticker.number}) - ${sticker.name}`);
    }
    
    return {
      id: sticker.id,
      name: sticker.name,
      team: sticker.team,
      teamlogo: sticker.teamLogo,
      category: sticker.category,
      imageurl: sticker.imageUrl,
      number: sticker.number, // Now this properly handles both numeric and string values
      isowned: sticker.isOwned,
      isduplicate: sticker.isDuplicate,
      duplicatecount: sticker.duplicateCount,
      albumid: sticker.albumId,
    };
  });
  
  return await saveBatch('stickers', adjustedItems);
}
