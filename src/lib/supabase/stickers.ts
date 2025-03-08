
import { supabase } from './client';
import { Sticker, isSticker } from '../types';
import { saveBatch } from './batch-operations';

export async function fetchStickers() {
  console.log('Fetching stickers from Supabase...');
  const { data, error } = await supabase.from('stickers').select('*');
  if (error) {
    console.error('Error fetching stickers:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} stickers from Supabase`);
  console.log('Fetched data:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק Sticker
  const adjustedData = data.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamLogo: sticker.teamlogo,
    category: sticker.category,
    imageUrl: sticker.imageurl,
    number: sticker.number,
    isOwned: sticker.isowned,
    isDuplicate: sticker.isduplicate,
    duplicateCount: sticker.duplicatecount,
    albumId: sticker.albumid,
  }));

  console.log('Adjusted data:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as Sticker[];
}

export async function saveSticker(sticker: Sticker) {
  console.log('Saving sticker to Supabase:', sticker.id);
  const supabaseSticker = {
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamlogo: sticker.teamLogo,
    category: sticker.category,
    imageurl: sticker.imageUrl,
    number: sticker.number,
    isowned: sticker.isOwned,
    isduplicate: sticker.isDuplicate,
    duplicatecount: sticker.duplicateCount,
    albumid: sticker.albumId,
  };
  console.log('JSON שנשלח:', JSON.stringify(supabaseSticker, null, 2));
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
  
  const adjustedItems = stickers.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamlogo: sticker.teamLogo,
    category: sticker.category,
    imageurl: sticker.imageUrl,
    number: sticker.number,
    isowned: sticker.isOwned,
    isduplicate: sticker.isDuplicate,
    duplicatecount: sticker.duplicateCount,
    albumid: sticker.albumId,
  }));
  
  return await saveBatch('stickers', adjustedItems);
}
