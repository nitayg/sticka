
import { supabase } from '../supabase';
import { syncWithSupabase } from './sync-manager';
import { StorageEvents } from './constants';

// Track active channel to prevent multiple subscriptions
let activeChannel: any = null;
// Add debounce mechanism to prevent too frequent syncs
let syncDebounceTimeout: any = null;
let eventsReceived = 0;

// Debounced sync function with increased timeout
const debouncedSync = () => {
  // Clear any existing timeout
  if (syncDebounceTimeout) {
    clearTimeout(syncDebounceTimeout);
  }
  
  // Set a new timeout with a longer delay to prevent rapid consecutive syncs
  syncDebounceTimeout = setTimeout(() => {
    console.log(`Triggering sync after receiving ${eventsReceived} events`);
    syncWithSupabase();
    eventsReceived = 0;
  }, 3000); // 3 second debounce to collect more changes before syncing
};

// Set up real-time subscriptions to Supabase with improved error handling
export const setupRealtimeSubscriptions = () => {
  console.log('Setting up real-time subscriptions...');
  
  // If we already have an active channel, unsubscribe from it first
  if (activeChannel) {
    console.log('Closing previous realtime channel');
    activeChannel.unsubscribe();
    activeChannel = null;
  }
  
  // Create a channel for all tables with improved configuration
  const channel = supabase.channel('public:all-changes', {
    config: {
      broadcast: { self: false }, // Critical: Don't receive your own changes to prevent loops
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
    eventsReceived++;
    debouncedSync();
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'stickers' 
  }, (payload) => {
    console.log('Real-time update for stickers:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.STICKERS, { detail: payload }));
    eventsReceived++;
    debouncedSync();
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'users' 
  }, (payload) => {
    console.log('Real-time update for users:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.USERS, { detail: payload }));
    eventsReceived++;
    debouncedSync();
  })
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'exchange_offers' 
  }, (payload) => {
    console.log('Real-time update for exchange offers:', payload);
    window.dispatchEvent(new CustomEvent(StorageEvents.EXCHANGE_OFFERS, { detail: payload }));
    eventsReceived++;
    debouncedSync();
  });
  
  // Add system level event handler for reconnection events
  channel.on('system', { event: 'reconnect' }, () => {
    console.log('Reconnected to Supabase realtime server');
    // Trigger a sync to ensure data is up-to-date after reconnection
    // Use debounce to prevent immediate sync which might cause conflicts
    setTimeout(() => {
      syncWithSupabase();
    }, 1000);
  });
  
  // Enhanced subscription with online/offline detection
  const subscribeToChannel = () => {
    channel.subscribe((status: string) => {
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
    if (channel.state !== 'joined') {
      subscribeToChannel();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Browser is offline, realtime updates paused');
    // No need to unsubscribe, the client will try to reconnect automatically
    // when the connection is restored
  });
  
  // Store the active channel for reference
  activeChannel = channel;
  
  return channel;
};

// Helper function to manually reconnect channel (can be exported for manual reconnection)
export const reconnectRealtimeChannel = (channel: ReturnType<typeof supabase.channel>) => {
  if (!activeChannel) {
    console.log('No active channel, creating new connection');
    return setupRealtimeSubscriptions();
  }
  
  if (activeChannel.state !== 'joined') {
    console.log('Manually reconnecting realtime channel...');
    activeChannel.subscribe();
  } else {
    console.log('Channel already subscribed, no action needed');
  }
  
  return activeChannel;
};
