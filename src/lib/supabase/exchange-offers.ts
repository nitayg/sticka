
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
  return true;
}

export async function saveExchangeOfferBatch(offers: ExchangeOffer[]) {
  if (!offers.length) return true;
  
  console.log(`Saving ${offers.length} exchange offers to Supabase`);
  
  const adjustedItems = offers.map((offer) => ({
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
  }));
  
  return await saveBatch('exchange_offers', adjustedItems);
}
