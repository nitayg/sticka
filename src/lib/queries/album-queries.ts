
import { supabase } from "../supabase/client";
import { getAllAlbums } from "../album-operations";

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
