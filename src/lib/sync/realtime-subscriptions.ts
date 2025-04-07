
import { supabase } from '../supabase';
import { syncWithSupabase } from './sync-manager';
import { StorageEvents } from './constants';

// Global channel variable to ensure only one connection is maintained
let globalChannel = null;

// Set up real-time subscriptions to Supabase with improved error handling
export const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // If channel already exists, return it instead of creating a new one
  if (globalChannel) {
    console.log('Using existing realtime channel');
    return globalChannel;
  }
  
  // Create a channel for all tables with improved configuration
  globalChannel = supabase.channel('public:all-changes', {
    config: {
      broadcast: { self: false }, 
      presence: { key: 'client-' + Math.floor(Math.random() * 1000000) },
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
  globalChannel.on('system', { event: 'reconnect' }, () => {
    console.log('Reconnected to Supabase realtime server');
    // Trigger a sync to ensure data is up-to-date after reconnection
    syncWithSupabase();
  });
  
  // Enhanced subscription with online/offline detection
  const subscribeToChannel = () => {
    // Check if channel is already subscribed
    if (globalChannel.state === 'joined') {
      console.log('Channel already subscribed, skipping subscription');
      return;
    }
    
    console.log('Subscribing to Supabase channel');
    globalChannel.subscribe((status) => {
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
    // Check status and resubscribe if needed
    if (globalChannel.state !== 'joined') {
      subscribeToChannel();
    }
  });
  
  return globalChannel;
};

// Helper function to manually reconnect channel (can be exported for manual reconnection)
export const reconnectRealtimeChannel = (channel) => {
  if (!channel || channel.state !== 'joined') {
    console.log('Manually reconnecting realtime channel...');
    if (!globalChannel) {
      globalChannel = setupRealtimeSubscriptions();
    } else {
      // Check if not already subscribed
      if (globalChannel.state !== 'joined') {
        globalChannel.subscribe();
      } else {
        console.log('Channel already subscribed, skipping subscription');
      }
    }
    return globalChannel;
  } else {
    console.log('Channel already subscribed, no action needed');
    return channel;
  }
};
