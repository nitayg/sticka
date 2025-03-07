
import { supabase } from '../supabase';
import { deviceId, MAX_RECONNECT_ATTEMPTS } from './constants';

// Set up real-time subscriptions to Supabase with improved error handling
export const setupRealtimeSubscriptions = () => {
  console.log('[Sync] Setting up real-time subscriptions...');
  
  try {
    // Create a channel for all tables with specific channel name
    const channelId = `public:all-changes:${deviceId}`;
    console.log(`[Sync] Creating realtime channel: ${channelId}`);
    
    // Track reconnection attempts
    let reconnectAttempts = 0;
    
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'albums' 
      }, (payload) => {
        console.log('[Sync] Real-time update for albums:', payload);
        // Use a small delay to avoid race conditions
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'stickers' 
      }, (payload) => {
        console.log('[Sync] Real-time update for stickers:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'users' 
      }, (payload) => {
        console.log('[Sync] Real-time update for users:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'exchange_offers' 
      }, (payload) => {
        console.log('[Sync] Real-time update for exchange offers:', payload);
        setTimeout(() => syncWithSupabase(), 500);
      })
      .on('error', (error) => {
        console.error('[Sync] Realtime subscription error:', error);
      });
    
    channel.subscribe((status, error) => {
      console.log('[Sync] Supabase channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[Sync] Successfully subscribed to real-time updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Sync] Failed to subscribe to real-time updates', error);
        
        // Try to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.pow(2, reconnectAttempts) * 1000;
          reconnectAttempts++;
          
          console.log(`[Sync] Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          
          setTimeout(() => {
            channel.subscribe();
          }, delay);
        } else {
          console.error('[Sync] Max reconnection attempts reached, falling back to polling');
        }
      }
    });
    
    // Return the channel for cleanup purposes
    return channel;
  } catch (error) {
    console.error('[Sync] Error setting up realtime subscriptions:', error);
    return null;
  }
};

// Import the syncWithSupabase function to avoid circular dependency issues
import { syncWithSupabase } from './sync-manager';
