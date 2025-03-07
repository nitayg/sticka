
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, ExchangeOffer, User } from './types';

const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWlsbWNzeWRrYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODM5OTEsImV4cCI6MjA1Njc1OTk5MX0.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA';

// Create a Supabase client with enhanced realtime configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'sticker-album-app'
    }
  }
});

// Debug Supabase connection issues
supabase.channel('system').on('system', { event: '*' }, (payload) => {
  console.log('Supabase system event:', payload);
}).subscribe((status) => {
  console.log('Supabase system channel status:', status);
});

// Functions for albums
export async function fetchAlbums() {
  console.log('Fetching albums from Supabase...');
  const { data, error } = await supabase.from('albums').select('*');
  if (error) {
    console.error('Error fetching albums:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} albums from Supabase`);
  return data as Album[];
}

export async function saveAlbum(album: Album) {
  console.log('Saving album to Supabase:', album.id);
  const supabaseAlbum = {
    id: album.id,
    name: album.name,
    totalstickers: album.totalStickers, // תיקון שם
    description: album.description,
    year: album.year,
    coverimage: album.coverImage, // תיקון שם
  };
  console.log('JSON שנשלח:', JSON.stringify(supabaseAlbum, null, 2));
  const { data, error } = await supabase
    .from('albums')
    .upsert(supabaseAlbum, { onConflict: 'id' });
  
  if (error) {
    console.error('Error saving album:', error);
    return false;
  }
  return true;
}

export async function deleteAlbumFromSupabase(id: string) {
  console.log('Deleting album from Supabase:', id);
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
  console.log('Fetching stickers from Supabase...');
  const { data, error } = await supabase.from('stickers').select('*');
  if (error) {
    console.error('Error fetching stickers:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} stickers from Supabase`);
  return data as Sticker[];
}

export async function saveSticker(sticker: Sticker) {
  console.log('Saving sticker to Supabase:', sticker.id);
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

// Functions for exchange offers
export async function fetchExchangeOffers() {
  console.log('Fetching exchange offers from Supabase...');
  const { data, error } = await supabase.from('exchange_offers').select('*');
  if (error) {
    console.error('Error fetching exchange offers:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} exchange offers from Supabase`);
  return data as ExchangeOffer[];
}

export async function saveExchangeOffer(offer: ExchangeOffer) {
  console.log('Saving exchange offer to Supabase:', offer.id);
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
  console.log('Deleting exchange offer from Supabase:', id);
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
  console.log('Fetching users from Supabase...');
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} users from Supabase`);
  return data as User[];
}

export async function saveUser(user: User) {
  console.log('Saving user to Supabase:', user.id);
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
  
  console.log(`Saving ${items.length} items to ${tableName}`);
  
  try {
    // Split into chunks to avoid Supabase's row limit
    const chunkSize = 100; // Reduced chunk size for better reliability
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      const { error } = await supabase
        .from(tableName)
        .upsert(chunk, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error(`Error saving batch to ${tableName} (chunk ${i}-${i+chunk.length}):`, error);
        console.error('Error details:', JSON.stringify(error));
        return false;
      }
      
      // Add a small delay between chunks to prevent rate limiting
      if (items.length > chunkSize && i + chunkSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`Successfully saved ${items.length} items to ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error in saveBatch for ${tableName}:`, error);
    return false;
  }
}
