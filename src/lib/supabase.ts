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
  console.log('Fetched data:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק Album
  const adjustedData = data.map((album) => ({
    id: album.id,
    name: album.name,
    totalStickers: album.totalstickers,
    description: album.description,
    year: album.year,
    coverImage: album.coverimage,
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
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting album:', error);
    return false;
  }
  console.log('Album deleted, notifying Realtime...');

  // שידור אירוע Realtime כדי לעדכן את הלקוחות
  supabase
    .channel('albums')
    .send({
      type: 'broadcast',
      event: 'album_deleted',
      payload: { id },
    })
    .subscribe();

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
  console.log('Sticker deleted, notifying Realtime...');

  // שידור אירוע Realtime
  supabase
    .channel('stickers')
    .send({
      type: 'broadcast',
      event: 'sticker_deleted',
      payload: { id },
    })
    .subscribe();

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
  console.log('Fetched data:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק ExchangeOffer
  const adjustedData = data.map((offer) => ({
    id: offer.id,
    userId: offer.userid,
    userName: offer.username,
    userAvatar: offer.useravatar,
    offeredStickerId: offer.offeredstickerid,
    offeredStickerName: offer.offeredstickername,
    wantedStickerId: offer.wantedstickerid,
    wantedStickerName: offer.wantedstickername,
    status: offer.status,
    exchangeMethod: offer.exchangemethod,
    location: offer.location,
    phone: offer.phone,
    color: offer.color,
    albumId: offer.albumid,
  }));

  console.log('Adjusted data:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as ExchangeOffer[];
}

export async function saveExchangeOffer(offer: ExchangeOffer) {
  console.log('Saving exchange offer to Supabase:', offer.id);
  const supabaseOffer = {
    id: offer.id,
    userid: offer.userId,
    username: offer.userName,
    useravatar: offer.userAvatar,
    offeredstickerid: offer.offeredStickerId,
    offeredstickername: offer.offeredStickerName,
    wantedstickerid: offer.wantedStickerId,
    wantedstickername: offer.wantedStickerName,
    status: offer.status,
    exchangemethod: offer.exchangeMethod,
    location: offer.location,
    phone: offer.phone,
    color: offer.color,
    albumid: offer.albumId,
  };
  console.log('JSON שנשלח:', JSON.stringify(supabaseOffer, null, 2));
  const { data, error } = await supabase
    .from('exchange_offers')
    .upsert(supabaseOffer, { onConflict: 'id' })
    .select('*');
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
  console.log('Exchange offer deleted, notifying Realtime...');

  // שידור אירוע Realtime
  supabase
    .channel('exchange_offers')
    .send({
      type: 'broadcast',
      event: 'exchange_offer_deleted',
      payload: { id },
    })
    .subscribe();

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
  console.log('Fetched data:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק User
  const adjustedData = data.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    stickerCount: {
      total: user.totalstickers,
      owned: user.ownedstickers,
      needed: user.neededstickers,
      duplicates: user.duplicatestickers,
    },
    location: user.location,
    phone: user.phone,
  }));

  console.log('Adjusted data:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as User[];
}

export async function saveUser(user: User) {
  console.log('Saving user to Supabase:', user.id);
  const supabaseUser = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    totalstickers: user.stickerCount?.total,
    ownedstickers: user.stickerCount?.owned,
    neededstickers: user.stickerCount?.needed,
    duplicatestickers: user.stickerCount?.duplicates,
    location: user.location,
    phone: user.phone,
  };
  console.log('JSON שנשלח:', JSON.stringify(supabaseUser, null, 2));
  const { data, error } = await supabase
    .from('users')
    .upsert(supabaseUser, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('Error saving user:', error);
    return false;
  }
  return true;
}

export async function deleteUserFromSupabase(id: string) {
  console.log('Deleting user from Supabase:', id);
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }
  console.log('User deleted, notifying Realtime...');

  // שידור אירוע Realtime
  supabase
    .channel('users')
    .send({
      type: 'broadcast',
      event: 'user_deleted',
      payload: { id },
    })
    .subscribe();

  return true;
}

// Create or update multiple items in a transaction
export async function saveBatch<T extends { id: string }>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`Received items for ${tableName}:`, JSON.stringify(items, null, 2));
  console.log(`Saving ${items.length} items to ${tableName}`);

  const adjustedItems = items.map((item) => {
    if (tableName === 'albums') {
      return {
        id: item.id,
        name: item.name,
        totalstickers: item.totalStickers,
        description: item.description,
        year: item.year,
        coverimage: item.coverImage,
      };
    } else if (tableName === 'stickers') {
      return {
        id: item.id,
        name: item.name,
        team: item.team,
        teamlogo: item.teamLogo,
        category: item.category,
        imageurl: item.imageUrl,
        number: item.number,
        isowned: item.isOwned,
        isduplicate: item.isDuplicate,
        duplicatecount: item.duplicateCount,
        albumid: item.albumId,
      };
    } else if (tableName === 'exchange_offers') {
      return {
        id: item.id,
        userid: item.userId,
        username: item.userName,
        useravatar: item.userAvatar,
        offeredstickerid: item.offeredStickerId,
        offeredstickername: item.offeredStickerName,
        wantedstickerid: item.wantedStickerId,
        wantedstickername: item.wantedStickerName,
        status: item.status,
        exchangemethod: item.exchangeMethod,
        location: item.location,
        phone: item.phone,
        color: item.color,
        albumid: item.albumId,
      };
    } else if (tableName === 'users') {
      return {
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        totalstickers: item.stickerCount?.total,
        ownedstickers: item.stickerCount?.owned,
        neededstickers: item.stickerCount?.needed,
        duplicatestickers: item.stickerCount?.duplicates,
        location: item.location,
        phone: item.phone,
      };
    }
    return item;
  });

  console.log('JSON שנשלח:', JSON.stringify(adjustedItems, null, 2));

  // בדוק את המצב בשרת לפני השמירה
  const existingItems = await supabase.from(tableName).select('id');
  const existingIds = existingItems.data.map((item) => item.id);

  const filteredItems = adjustedItems.filter((item) => 
  // אם הפריט לא קיים בשרת, כנראה שהוא נמחק במקום אחר
  // אז אנחנו לא רוצים להחזיר אותו לשרת
  existingIds.includes(item.id)
);

  if (filteredItems.length !== adjustedItems.length) {
    console.log(`Filtered out ${adjustedItems.length - filteredItems.length} items that no longer exist on the server`);
  }

  try {
    const chunkSize = 100;
    for (let i = 0; i < filteredItems.length; i += chunkSize) {
      const chunk = filteredItems.slice(i, i + chunkSize);

      const { error } = await supabase
        .from(tableName)
        .upsert(chunk, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select('*');

      if (error) {
        console.error(
          `Error saving batch to ${tableName} (chunk ${i}-${i + chunk.length}):`,
          error
        );
        console.error('Error details:', JSON.stringify(error));
        return false;
      }

      if (filteredItems.length > chunkSize && i + chunkSize < filteredItems.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    console.log(`Successfully saved ${filteredItems.length} items to ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error in saveBatch for ${tableName}:`, error);
    return false;
  }
}
