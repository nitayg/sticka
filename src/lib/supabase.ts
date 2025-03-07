
import { createClient } from '@supabase/supabase-js';
import { Album, Sticker, User, ExchangeOffer } from './types';

// Define the Supabase URL and key
const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWlsbWNzeWRrYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODM5OTEsImV4cCI6MjA1Njc1OTk5MX0.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA';

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all albums from Supabase
export const fetchAlbums = async (): Promise<Album[]> => {
  try {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch albums:', error);
    return [];
  }
};

// Fetch all stickers from Supabase
export const fetchStickers = async (): Promise<Sticker[]> => {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .order('number', { ascending: true });
    
    if (error) {
      console.error('Error fetching stickers:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch stickers:', error);
    return [];
  }
};

// Fetch all users from Supabase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

// Fetch all exchange offers from Supabase
export const fetchExchangeOffers = async (): Promise<ExchangeOffer[]> => {
  try {
    const { data, error } = await supabase
      .from('exchange_offers')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching exchange offers:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch exchange offers:', error);
    return [];
  }
};

// Save a batch of items to Supabase
export const saveBatch = async <T extends { id: string }>(tableName: string, items: T[]): Promise<void> => {
  if (!items || items.length === 0) return;
  
  try {
    // Process in smaller batches to avoid overloading Supabase
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error saving batch to ${tableName}:`, error);
        throw error;
      }
    }
    
    console.log(`Successfully saved ${items.length} items to ${tableName}`);
  } catch (error) {
    console.error(`Failed to save batch to ${tableName}:`, error);
    throw error;
  }
};

// Set up real-time subscriptions
export const setupRealtimeSubscriptions = (onDataChange: () => void) => {
  try {
    // Create a channel for all tables
    const channel = supabase.channel('public:all-changes');
    
    channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'albums' 
      }, () => {
        console.log('Real-time update for albums');
        onDataChange();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'stickers' 
      }, () => {
        console.log('Real-time update for stickers');
        onDataChange();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'users' 
      }, () => {
        console.log('Real-time update for users');
        onDataChange();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'exchange_offers' 
      }, () => {
        console.log('Real-time update for exchange offers');
        onDataChange();
      });
    
    const subscription = channel.subscribe((status) => {
      console.log('Supabase channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to real-time updates');
      }
    });
    
    return { channel, subscription };
  } catch (error) {
    console.error('Error setting up real-time subscriptions:', error);
    return null;
  }
};

// Save an album batch to Supabase
export const saveAlbumBatch = async (albums: Album[]): Promise<void> => {
  if (!albums || albums.length === 0) return;
  
  const processedAlbums = albums.map(album => ({
    id: album.id,
    name: album.name,
    totalStickers: album.totalStickers,
    description: album.description,
    year: album.year,
    coverImage: album.coverImage,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt
  }));
  
  await saveBatch('albums', processedAlbums);
};

// Save a sticker batch to Supabase
export const saveStickerBatch = async (stickers: Sticker[]): Promise<void> => {
  if (!stickers || stickers.length === 0) return;
  
  const processedStickers = stickers.map(sticker => ({
    id: sticker.id,
    name: sticker.name,
    team: sticker.team,
    teamLogo: sticker.teamLogo,
    category: sticker.category,
    imageUrl: sticker.imageUrl,
    number: sticker.number,
    isOwned: sticker.isOwned,
    isDuplicate: sticker.isDuplicate,
    duplicateCount: sticker.duplicateCount,
    albumId: sticker.albumId,
    createdAt: sticker.createdAt,
    updatedAt: sticker.updatedAt
  }));
  
  await saveBatch('stickers', processedStickers);
};

// Save an exchange offer batch to Supabase
export const saveExchangeOfferBatch = async (exchangeOffers: ExchangeOffer[]): Promise<void> => {
  if (!exchangeOffers || exchangeOffers.length === 0) return;
  
  const processedExchangeOffers = exchangeOffers.map(offer => ({
    id: offer.id,
    userId: offer.userId,
    userName: offer.userName,
    userAvatar: offer.userAvatar,
    offeredStickerId: offer.offeredStickerId,
    offeredStickerName: offer.offeredStickerName,
    wantedStickerId: offer.wantedStickerId,
    wantedStickerName: offer.wantedStickerName,
    status: offer.status,
    exchangeMethod: offer.exchangeMethod,
    location: offer.location,
    phone: offer.phone,
    color: offer.color,
    albumId: offer.albumId,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt
  }));
  
  await saveBatch('exchange_offers', processedExchangeOffers);
};

// Save a user batch to Supabase
export const saveUserBatch = async (users: User[]): Promise<void> => {
  if (!users || users.length === 0) return;
  
  const processedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    stickerCount: user.stickerCount,
    totalStickers: user.totalStickers,
    duplicateStickers: user.duplicateStickers,
    completionPercentage: user.completionPercentage,
    location: user.location,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
  
  await saveBatch('users', processedUsers);
};
