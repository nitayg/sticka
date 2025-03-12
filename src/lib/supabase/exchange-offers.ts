
import { supabase } from './client';
import { ExchangeOffer, isExchangeOffer } from '../types';
import { saveBatch } from './batch-operations';

export async function fetchExchangeOffers() {
  console.log('Fetching exchange offers from Supabase...');
  const { data, error } = await supabase.from('exchange_offers').select('*');
  if (error) {
    console.error('Error fetching exchange offers:', error);
    return null;
  }
  console.log(`Fetched ${data?.length || 0} exchange offers from Supabase`);
  console.log('Fetched exchange offers data:', JSON.stringify(data, null, 2));

  // Ensure field names match the ExchangeOffer interface
  const adjustedData = data.map((offer) => ({
    id: offer.id,
    userId: offer.userid,
    userName: offer.username,
    userAvatar: offer.useravatar,
    offeredStickerId: Array.isArray(offer.offeredstickerid) ? offer.offeredstickerid : [],
    offeredStickerName: offer.offeredstickername,
    wantedStickerId: Array.isArray(offer.wantedstickerid) ? offer.wantedstickerid : [],
    wantedStickerName: offer.wantedstickername,
    status: offer.status,
    exchangeMethod: offer.exchangemethod,
    location: offer.location,
    phone: offer.phone,
    color: offer.color,
    albumId: offer.albumid,
    isDeleted: offer.isdeleted || false,
    lastModified: offer.lastmodified
  }));

  console.log('Adjusted exchange offers data:', JSON.stringify(adjustedData, null, 2));
  return adjustedData as ExchangeOffer[];
}

export async function saveExchangeOffer(offer: ExchangeOffer) {
  console.log('Saving exchange offer to Supabase:', offer);
  
  // Ensure offeredStickerId and wantedStickerId are arrays
  const offeredStickerIdArray = Array.isArray(offer.offeredStickerId) 
    ? offer.offeredStickerId 
    : [offer.offeredStickerId].filter(Boolean);
  
  const wantedStickerIdArray = Array.isArray(offer.wantedStickerId) 
    ? offer.wantedStickerId 
    : [offer.wantedStickerId].filter(Boolean);
  
  // Important: Remove the userid field completely since it has a foreign key constraint
  // We'll use a generated ID instead that doesn't reference any foreign table
  const supabaseOffer = {
    id: offer.id,
    // Remove userid field completely - it has a foreign key constraint
    username: offer.userName,
    useravatar: offer.userAvatar,
    offeredstickerid: offeredStickerIdArray,
    offeredstickername: offer.offeredStickerName,
    wantedstickerid: wantedStickerIdArray,
    wantedstickername: offer.wantedStickerName,
    status: offer.status,
    exchangemethod: offer.exchangeMethod,
    location: offer.location,
    phone: offer.phone,
    color: offer.color,
    albumid: offer.albumId,
    isdeleted: offer.isDeleted || false,
    lastmodified: offer.lastModified || Date.now()
  };
  
  console.log('Supabase exchange offer data being sent:', JSON.stringify(supabaseOffer, null, 2));
  
  const { data, error } = await supabase
    .from('exchange_offers')
    .upsert(supabaseOffer, { onConflict: 'id' })
    .select('*');
    
  if (error) {
    console.error('Error saving exchange offer:', error);
    return false;
  }
  
  console.log('Successfully saved exchange offer:', data);
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
  console.log('Successfully deleted exchange offer with ID:', id);
  return true;
}

export async function saveExchangeOfferBatch(offers: ExchangeOffer[]) {
  if (!offers.length) return true;
  
  console.log(`Saving ${offers.length} exchange offers to Supabase`);
  
  const adjustedItems = offers.map((offer) => {
    // Ensure arrays are properly handled
    const offeredStickerIdArray = Array.isArray(offer.offeredStickerId) 
      ? offer.offeredStickerId 
      : [offer.offeredStickerId].filter(Boolean);
    
    const wantedStickerIdArray = Array.isArray(offer.wantedStickerId) 
      ? offer.wantedStickerId 
      : [offer.wantedStickerId].filter(Boolean);
    
    // Important: Remove the userid field in batch operations as well
    return {
      id: offer.id,
      // Remove userid field completely
      username: offer.userName,
      useravatar: offer.userAvatar,
      offeredstickerid: offeredStickerIdArray,
      offeredstickername: offer.offeredStickerName,
      wantedstickerid: wantedStickerIdArray,
      wantedstickername: offer.wantedStickerName,
      status: offer.status,
      exchangemethod: offer.exchangeMethod,
      location: offer.location,
      phone: offer.phone,
      color: offer.color,
      albumid: offer.albumId,
      isdeleted: offer.isDeleted || false,
      lastmodified: offer.lastModified || Date.now()
    };
  });
  
  console.log('Batch exchange offers data being sent:', JSON.stringify(adjustedItems, null, 2));
  
  return await saveBatch('exchange_offers', adjustedItems);
}
