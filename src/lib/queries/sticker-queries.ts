import { supabase } from "../supabase/client";
import { Sticker } from "../types";
import { getStickersByAlbumId, setStickerData } from "../stickers/basic-operations";

// Optimized query to fetch stickers for a specific album
export const fetchStickersByAlbumId = async (albumId: string): Promise<Sticker[]> => {
  if (!albumId) return [];
  
  console.log(`[QUERY] Fetching stickers for album ${albumId}`);
  
  try {
    // First try local cache
    const localStickers = getStickersByAlbumId(albumId);
    if (localStickers.length > 0) {
      console.log(`[QUERY] Using ${localStickers.length} stickers from local cache for album ${albumId}`);
      return localStickers;
    }
    
    // If local cache is empty, fetch from Supabase
    console.log(`[QUERY] Local cache empty, fetching from Supabase for album ${albumId}`);
    const { data, error } = await supabase
      .from("stickers")
      .select("*")
      .eq("albumid", albumId)
      .order("number");
      
    if (error) {
      console.error(`[QUERY] Error fetching stickers for album ${albumId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`[QUERY] No stickers found for album ${albumId}`);
      return [];
    }
    
    // Convert from Supabase format to our app format
    const stickers: Sticker[] = data.map(sticker => ({
      id: sticker.id,
      number: sticker.number,
      name: sticker.name,
      team: sticker.team,
      category: sticker.category,
      isOwned: sticker.isowned,
      isDuplicate: sticker.isduplicate,
      duplicateCount: sticker.duplicatecount,
      albumId: sticker.albumid,
      teamLogo: sticker.teamlogo,
      imageUrl: sticker.imageurl,
    }));
    
    console.log(`[QUERY] Fetched ${stickers.length} stickers from Supabase for album ${albumId}`);
    
    // Cache the stickers locally for future use
    setStickerData(stickers, { albumId, action: 'fetch' });
    
    return stickers;
  } catch (error) {
    console.error(`[QUERY] Critical error fetching stickers for album ${albumId}:`, error);
    return [];
  }
};

// Query to fetch stickers only when we have the sticker numbers
export const fetchStickersByNumbers = async (
  albumId: string, 
  stickerNumbers: (string | number)[]
): Promise<Sticker[]> => {
  if (!albumId || !stickerNumbers.length) return [];
  
  console.log(`[QUERY] Fetching specific stickers for album ${albumId}`);
  
  try {
    // First check if we have them in local cache
    const localStickers = getStickersByAlbumId(albumId);
    const foundStickers = localStickers.filter(sticker => 
      stickerNumbers.includes(sticker.number)
    );
    
    // If we found all the stickers locally, use them
    if (foundStickers.length === stickerNumbers.length) {
      console.log(`[QUERY] Found all ${stickerNumbers.length} stickers in local cache`);
      return foundStickers;
    }
    
    // Otherwise fetch from Supabase
    console.log(`[QUERY] Fetching ${stickerNumbers.length} stickers from Supabase`);
    const { data, error } = await supabase
      .from("stickers")
      .select("*")
      .eq("albumid", albumId)
      .in("number", stickerNumbers);
      
    if (error) {
      console.error(`[QUERY] Error fetching stickers for album ${albumId}:`, error);
      return foundStickers; // Return what we found locally
    }
    
    if (!data || data.length === 0) {
      console.log(`[QUERY] No stickers found for the specified numbers`);
      return foundStickers; // Return what we found locally
    }
    
    // Convert from Supabase format to our app format
    const fetchedStickers: Sticker[] = data.map(sticker => ({
      id: sticker.id,
      number: sticker.number,
      name: sticker.name,
      team: sticker.team,
      category: sticker.category,
      isOwned: sticker.isowned,
      isDuplicate: sticker.isduplicate,
      duplicateCount: sticker.duplicatecount,
      albumId: sticker.albumid,
      teamLogo: sticker.teamlogo,
      imageUrl: sticker.imageurl,
    }));
    
    console.log(`[QUERY] Fetched ${fetchedStickers.length} stickers from Supabase`);
    
    // Merge with what we found locally
    const mergedStickers = [...foundStickers];
    
    // Add any new stickers we found from the API
    fetchedStickers.forEach(fetchedSticker => {
      if (!mergedStickers.some(s => s.id === fetchedSticker.id)) {
        mergedStickers.push(fetchedSticker);
      }
    });
    
    return mergedStickers;
  } catch (error) {
    console.error(`[QUERY] Critical error fetching stickers by numbers:`, error);
    return [];
  }
};
