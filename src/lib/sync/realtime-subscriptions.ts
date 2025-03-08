
import { supabase } from '../supabase';

// Set up real-time subscriptions to Supabase - trigger sync only on changes
export const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // Create a channel for all tables
  const channel = supabase.channel('public:all-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'albums' 
    }, (payload) => {
      console.log('Real-time update for albums:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'stickers' 
    }, (payload) => {
      console.log('Real-time update for stickers:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users' 
    }, (payload) => {
      console.log('Real-time update for users:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'exchange_offers' 
    }, (payload) => {
      console.log('Real-time update for exchange offers:', payload);
      // No automatic sync, will happen on app refresh or explicit event
    });
  
  channel.subscribe((status) => {
    console.log('Supabase channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to real-time updates');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to real-time updates');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        channel.subscribe();
      }, 5000);
    }
  });
  
  return channel;
};
