
import { supabase } from '../supabase';
import { syncWithSupabase } from './sync-manager';
import { StorageEvents } from './constants';

// Set up real-time subscriptions to Supabase with improved error handling
export const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // Create a channel for all tables with improved configuration
  const channel = supabase.channel('public:all-changes', {
    config: {
      broadcast: { self: true },
      presence: { key: 'client-' + Math.floor(Math.random() * 1000000) },
      retryInterval: 2000,
      retryBackoff: true,
      maxRetries: 10
    }
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'albums' 
  }, (payload) => {
    console.log('Real-time update for albums:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: payload }));
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'stickers' 
  }, (payload) => {
    console.log('Real-time update for stickers:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: payload }));
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'users' 
  }, (payload) => {
    console.log('Real-time update for users:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: payload }));
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'exchange_offers' 
  }, (payload) => {
    console.log('Real-time update for exchange offers:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: payload }));
  });
  
  // Add system level event handler for reconnection events
  channel.on('system', { event: 'reconnect' }, () => {
    console.log('Reconnected to Supabase realtime server');
    // Trigger a sync to ensure data is up-to-date after reconnection
    syncWithSupabase();
  });
  
  // Enhanced subscription with online/offline detection
  const subscribeToChannel = () => {
    channel.subscribe((status) => {
      console.log('Supabase channel status:', status);
      switch (status) {
        case 'SUBSCRIBED':
          console.log('Successfully subscribed to real-time updates');
          break;
        case 'TIMED_OUT':
          console.error('Subscription timed out, will retry...');
          setTimeout(subscribeToChannel, 5000);
          break;
        case 'CHANNEL_ERROR':
          console.error('Failed to subscribe to real-time updates');
          // Try to reconnect after a delay with exponential backoff
          setTimeout(subscribeToChannel, 5000);
          break;
        case 'CLOSED':
          // Check if browser is online before attempting to reconnect
          if (navigator.onLine) {
            console.log('Channel closed, attempting to reconnect...');
            setTimeout(subscribeToChannel, 3000);
          } else {
            console.log('Browser is offline, will reconnect when online');
            // Listen for online event to resubscribe
            const handleOnline = () => {
              console.log('Browser is online again, resubscribing...');
              window.removeEventListener('online', handleOnline);
              subscribeToChannel();
            };
            window.addEventListener('online', handleOnline);
          }
          break;
      }
    });
  };
  
  // Initial subscription
  subscribeToChannel();
  
  // Set up online/offline event listeners
  window.addEventListener('online', () => {
    console.log('Browser is online again, checking subscription...');
    if (channel.subscription.state !== 'SUBSCRIBED') {
      subscribeToChannel();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Browser is offline, realtime updates paused');
    // No need to unsubscribe, the client will try to reconnect automatically
    // when the connection is restored
  });
  
  return channel;
};

// Helper function to manually reconnect channel (can be exported for manual reconnection)
export const reconnectRealtimeChannel = (channel: ReturnType<typeof supabase.channel>) => {
  if (channel.subscription.state !== 'SUBSCRIBED') {
    console.log('Manually reconnecting realtime channel...');
    channel.subscribe();
  } else {
    console.log('Channel already subscribed, no action needed');
  }
};
