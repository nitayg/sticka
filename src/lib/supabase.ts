
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, ExchangeOffer, User, isAlbum, isSticker, isExchangeOffer, isUser, BaseModel } from './types';
import { canSync, markSyncStarted, markSyncCompleted, scheduleFutureSyncIfNeeded } from './syncManager';

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
  console.log('מושך אלבומים מ-Supabase...');
  // הוספת תנאי לשליפת רשומות שלא נמחקו בלבד
  const { data, error } = await supabase.from('albums')
    .select('*')
    .eq('isdeleted', false);
    
  if (error) {
    console.error('שגיאה במשיכת אלבומים:', error);
    return null;
  }
  console.log(`נמשכו ${data?.length || 0} אלבומים מ-Supabase`);
  console.log('Data שנמשך:', JSON.stringify(data, null, 2));

  // התאמת שמות השדות לממשק Album
  const adjustedData = data.map((album) => ({
    id: album.id,
    name: album.name,
    totalStickers: album.totalstickers,
    description: album.description,
    year: album.year,
    coverImage: album.coverimage,
    lastModified: album.lastmodified,
    isDeleted: album.isdeleted
  }));

  console.log('Data מותאם:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as Album[];
}

export async function saveAlbum(album: Album) {
  console.log('שומר אלבום ל-Supabase:', album.id);
  const timestamp = Date.now();
  
  const supabaseAlbum = {
    id: album.id,
    name: album.name,
    totalstickers: album.totalStickers,
    description: album.description,
    year: album.year,
    coverimage: album.coverImage,
    lastmodified: timestamp,
    isdeleted: album.isDeleted || false
  };
  
  console.log('JSON שנשלח:', JSON.stringify(supabaseAlbum, null, 2));
  const { data, error } = await supabase
    .from('albums')
    .upsert(supabaseAlbum, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('שגיאה בשמירת אלבום:', error);
    return false;
  }
  return true;
}

export async function deleteAlbumFromSupabase(id: string) {
  console.log('מבצע מחיקה רכה של אלבום ב-Supabase:', id);
  const timestamp = Date.now();
  
  // ביצוע מחיקה רכה במקום מחיקה פיזית
  const { error } = await supabase
    .from('albums')
    .update({ 
      isdeleted: true,
      lastmodified: timestamp
    })
    .eq('id', id);
    
  if (error) {
    console.error('שגיאה במחיקת אלבום:', error);
    return false;
  }
  
  console.log('אלבום נמחק בהצלחה (מחיקה רכה)');
  return true;
}

// Functions for stickers
export async function fetchStickers() {
  console.log('מושך מדבקות מ-Supabase...');
  // הוספת תנאי לשליפת רשומות שלא נמחקו בלבד
  const { data, error } = await supabase.from('stickers')
    .select('*')
    .eq('isdeleted', false);
    
  if (error) {
    console.error('שגיאה במשיכת מדבקות:', error);
    return null;
  }
  console.log(`נמשכו ${data?.length || 0} מדבקות מ-Supabase`);
  console.log('Data שנמשך:', JSON.stringify(data, null, 2));

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
    lastModified: sticker.lastmodified,
    isDeleted: sticker.isdeleted
  }));

  console.log('Data מותאם:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as Sticker[];
}

export async function saveSticker(sticker: Sticker) {
  console.log('שומר מדבקה ל-Supabase:', sticker.id);
  const timestamp = Date.now();
  
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
    lastmodified: timestamp,
    isdeleted: sticker.isDeleted || false
  };
  
  console.log('JSON שנשלח:', JSON.stringify(supabaseSticker, null, 2));
  const { data, error } = await supabase
    .from('stickers')
    .upsert(supabaseSticker, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('שגיאה בשמירת מדבקה:', error);
    return false;
  }
  return true;
}

export async function deleteStickerFromSupabase(id: string) {
  console.log('מבצע מחיקה רכה של מדבקה ב-Supabase:', id);
  const timestamp = Date.now();
  
  // ביצוע מחיקה רכה במקום מחיקה פיזית
  const { error } = await supabase
    .from('stickers')
    .update({ 
      isdeleted: true,
      lastmodified: timestamp
    })
    .eq('id', id);
    
  if (error) {
    console.error('שגיאה במחיקת מדבקה:', error);
    return false;
  }
  
  console.log('מדבקה נמחקה בהצלחה (מחיקה רכה)');
  return true;
}

// Functions for exchange offers
export async function fetchExchangeOffers() {
  console.log('מושך הצעות החלפה מ-Supabase...');
  // הוספת תנאי לשליפת רשומות שלא נמחקו בלבד
  const { data, error } = await supabase.from('exchange_offers')
    .select('*')
    .eq('isdeleted', false);
    
  if (error) {
    console.error('שגיאה במשיכת הצעות החלפה:', error);
    return null;
  }
  console.log(`נמשכו ${data?.length || 0} הצעות החלפה מ-Supabase`);
  console.log('Data שנמשך:', JSON.stringify(data, null, 2));

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
    lastModified: offer.lastmodified,
    isDeleted: offer.isdeleted
  }));

  console.log('Data מותאם:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as ExchangeOffer[];
}

export async function saveExchangeOffer(offer: ExchangeOffer) {
  console.log('שומר הצעת החלפה ל-Supabase:', offer.id);
  const timestamp = Date.now();
  
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
    lastmodified: timestamp,
    isdeleted: offer.isDeleted || false
  };
  
  console.log('JSON שנשלח:', JSON.stringify(supabaseOffer, null, 2));
  const { data, error } = await supabase
    .from('exchange_offers')
    .upsert(supabaseOffer, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('שגיאה בשמירת הצעת החלפה:', error);
    return false;
  }
  return true;
}

export async function deleteExchangeOfferFromSupabase(id: string) {
  console.log('מבצע מחיקה רכה של הצעת החלפה ב-Supabase:', id);
  const timestamp = Date.now();
  
  // ביצוע מחיקה רכה במקום מחיקה פיזית
  const { error } = await supabase
    .from('exchange_offers')
    .update({ 
      isdeleted: true,
      lastmodified: timestamp
    })
    .eq('id', id);
    
  if (error) {
    console.error('שגיאה במחיקת הצעת החלפה:', error);
    return false;
  }
  
  console.log('הצעת החלפה נמחקה בהצלחה (מחיקה רכה)');
  return true;
}

// Functions for users
export async function fetchUsers() {
  console.log('מושך משתמשים מ-Supabase...');
  // הוספת תנאי לשליפת רשומות שלא נמחקו בלבד
  const { data, error } = await supabase.from('users')
    .select('*')
    .eq('isdeleted', false);
    
  if (error) {
    console.error('שגיאה במשיכת משתמשים:', error);
    return null;
  }
  console.log(`נמשכו ${data?.length || 0} משתמשים מ-Supabase`);
  console.log('Data שנמשך:', JSON.stringify(data, null, 2));

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
    lastModified: user.lastmodified,
    isDeleted: user.isdeleted
  }));

  console.log('Data מותאם:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as User[];
}

export async function saveUser(user: User) {
  console.log('שומר משתמש ל-Supabase:', user.id);
  const timestamp = Date.now();
  
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
    lastmodified: timestamp,
    isdeleted: user.isDeleted || false
  };
  
  console.log('JSON שנשלח:', JSON.stringify(supabaseUser, null, 2));
  const { data, error } = await supabase
    .from('users')
    .upsert(supabaseUser, { onConflict: 'id' })
    .select('*');
  if (error) {
    console.error('שגיאה בשמירת משתמש:', error);
    return false;
  }
  return true;
}

// Create or update multiple items in a transaction with improved handling for deleted items
export async function saveBatch<T extends { id: string } & Partial<BaseModel>>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`התקבלו פריטים עבור ${tableName}:`, JSON.stringify(items, null, 2));
  console.log(`שומר ${items.length} פריטים ל-${tableName}`);
  
  const timestamp = Date.now();

  try {
    // קבלת נתונים קיימים מהשרת להשוואה
    const { data: existingData, error: fetchError } = await supabase
      .from(tableName)
      .select('id, lastmodified')
      .eq('isdeleted', false);
    
    if (fetchError) {
      console.error(`שגיאה במשיכת נתונים קיימים מ-${tableName}:`, fetchError);
      return false;
    }
    
    const existingItems = existingData || [];
    const existingMap = new Map(existingItems.map(item => [item.id, item.lastmodified]));

    // Adjust items based on the table name, using type guards to ensure TypeScript type safety
    const adjustedItems = items.map((item) => {
      // Set lastmodified for all items to current timestamp
      const baseFields = {
        lastmodified: timestamp,
        isdeleted: item.isDeleted || false
      };
      
      if (tableName === 'albums' && isAlbum(item)) {
        return {
          id: item.id,
          name: item.name,
          totalstickers: item.totalStickers,
          description: item.description,
          year: item.year,
          coverimage: item.coverImage,
          ...baseFields
        };
      } else if (tableName === 'stickers' && isSticker(item)) {
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
          ...baseFields
        };
      } else if (tableName === 'exchange_offers' && isExchangeOffer(item)) {
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
          ...baseFields
        };
      } else if (tableName === 'users' && isUser(item)) {
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
          ...baseFields
        };
      }
      // If item doesn't match any known types, return it with base fields
      return { 
        ...item,
        ...baseFields
      } as any;
    });

    // סינון פריטים כדי לסנכרן רק את אלה ש:
    // 1. לא מסומנים כנמחקים מקומית, או
    // 2. מסומנים כנמחקים אבל עם חותמת זמן חדשה יותר מהגרסה בשרת
    const filteredItems = adjustedItems.filter(item => {
      const serverTimestamp = existingMap.get(item.id);
      
      // אם הפריט לא קיים בשרת, כלול אותו רק אם הוא לא נמחק
      if (!serverTimestamp) return !item.isdeleted;
      
      // אם הפריט קיים בשרת, כלול אותו אם הגרסה המקומית חדשה יותר
      return true; // נשלח את כל הפריטים בשלב זה לתיקון בעיות סנכרון
    });

    console.log('JSON שנשלח:', JSON.stringify(filteredItems, null, 2));

    // עיבוד לפי אצוות כדי למנוע חריגות
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
          `שגיאה בשמירת אצווה ל-${tableName} (אצווה ${i}-${i + chunk.length}):`,
          error
        );
        console.error('פרטי שגיאה:', JSON.stringify(error));
        return false;
      }

      if (filteredItems.length > chunkSize && i + chunkSize < filteredItems.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    console.log(`נשמרו בהצלחה ${filteredItems.length} פריטים ל-${tableName}`);
    return true;
  } catch (error) {
    console.error(`שגיאה ב-saveBatch עבור ${tableName}:`, error);
    return false;
  }
}
