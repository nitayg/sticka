
import { supabase } from './client';
import { User, isUser } from '../types';
import { saveBatch } from './batch-operations';

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

export async function saveUserBatch(users: User[]) {
  if (!users.length) return true;
  
  console.log(`Saving ${users.length} users to Supabase`);
  
  const adjustedItems = users.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    totalstickers: user.stickerCount?.total,
    ownedstickers: user.stickerCount?.owned,
    neededstickers: user.stickerCount?.needed,
    duplicatestickers: user.stickerCount?.duplicates,
    location: user.location,
    phone: user.phone,
  }));
  
  return await saveBatch('users', adjustedItems);
}
