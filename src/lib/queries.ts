import { supabase } from "./supabase/client";
import { Sticker } from "./types";
import { getStickersByAlbumId } from "./stickers/basic-operations";
import { getAllAlbums } from "./album-operations";

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
    const { setStickerData } = await import("./stickers/basic-operations");
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

// Function to create a stats object for the album
export const fetchAlbumStats = async (albumId: string): Promise<{
  total: number;
  owned: number;
  needed: number;
  duplicates: number;
  percentage: number;
}> => {
  try {
    const stickers = await fetchStickersByAlbumId(albumId);
    
    const total = stickers.length;
    const owned = stickers.filter(s => s.isOwned).length;
    const needed = total - owned;
    const duplicates = stickers.filter(s => s.isDuplicate).length;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    
    return { total, owned, needed, duplicates, percentage };
  } catch (error) {
    console.error(`Error calculating album stats for ${albumId}:`, error);
    return { total: 0, owned: 0, needed: 0, duplicates: 0, percentage: 0 };
  }
};

// Updated fetchAllAlbums function without using require
export const fetchAllAlbums = async () => {
  try {
    console.log("[QUERY] Fetching all albums");
    
    // First check if we have albums in memory cache
    const localAlbums = getAllAlbums();
    
    if (localAlbums && localAlbums.length > 0) {
      console.log(`[QUERY] Using ${localAlbums.length} albums from local cache`);
      return localAlbums;
    }
    
    // If no local cache, fetch from Supabase
    console.log(`[QUERY] Local album cache empty, fetching from Supabase`);
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("isDeleted", false)
      .order("lastModified", { ascending: false });
      
    if (error) {
      console.error(`[QUERY] Error fetching albums:`, error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    console.log(`[QUERY] Successfully fetched ${data.length} albums from Supabase`);
    return data;
  } catch (error) {
    console.error(`[QUERY] Critical error fetching albums:`, error);
    return [];
  }
};
