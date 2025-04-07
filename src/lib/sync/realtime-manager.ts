
/**
 * Realtime Manager
 * אחראי על ניהול תקשורת בזמן אמת עם Supabase
 */
import { supabase } from '../supabase';
import { StorageEvents } from './constants';
import { syncFromCloud } from './sync-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// הגדרת כותרות CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// מעקב אחר ערוץ התקשורת
let activeChannel: RealtimeChannel | null = null;

/**
 * יוצר ומגדיר ערוץ תקשורת בזמן אמת עם Supabase
 */
export const setupRealtimeConnection = (): RealtimeChannel => {
  console.log('Setting up real-time connection with Supabase...');
  
  // בטל ערוץ קודם אם קיים
  if (activeChannel) {
    console.log('Closing previous realtime channel');
    activeChannel.unsubscribe();
    activeChannel = null;
  }

  // יצירת ערוץ תקשורת חדש
  const channel = supabase.channel('public:all-changes', {
    config: {
      broadcast: { self: true },
      presence: { key: 'client-' + Math.floor(Math.random() * 1000000) },
    }
  });
  
  // הגדרת מאזינים לשינויים בטבלאות
  channel
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'albums' 
    }, (payload) => {
      console.log('Real-time update for albums:', payload);
      window.dispatchEvent(new CustomEvent(StorageEvents.DATA_CHANGED, { detail: { table: 'albums', payload } }));
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'stickers' 
    }, (payload) => {
      console.log('Real-time update for stickers:', payload);
      window.dispatchEvent(new CustomEvent(StorageEvents.DATA_CHANGED, { detail: { table: 'stickers', payload } }));
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'users' 
    }, (payload) => {
      console.log('Real-time update for users:', payload);
      window.dispatchEvent(new CustomEvent(StorageEvents.DATA_CHANGED, { detail: { table: 'users', payload } }));
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'exchange_offers' 
    }, (payload) => {
      console.log('Real-time update for exchange offers:', payload);
      window.dispatchEvent(new CustomEvent(StorageEvents.DATA_CHANGED, { detail: { table: 'exchange_offers', payload } }));
    });
  
  // הוספת מאזין לאירועי מערכת
  channel.on('system', { event: 'reconnect' }, () => {
    console.log('Reconnected to Supabase realtime server');
    // ביצוע סנכרון לאחר התחברות מחדש
    syncFromCloud();
  });
  
  // פונקציה לרישום לערוץ
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
          setTimeout(subscribeToChannel, 5000);
          break;
        case 'CLOSED':
          if (navigator.onLine) {
            console.log('Channel closed, attempting to reconnect...');
            setTimeout(subscribeToChannel, 3000);
          } else {
            console.log('Browser is offline, will reconnect when online');
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
  
  // רישום ראשוני
  subscribeToChannel();
  
  // הגדרת מאזינים למצב רשת
  window.addEventListener('online', () => {
    console.log('Browser is online again, checking subscription...');
    if (channel.state !== 'joined') {
      subscribeToChannel();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Browser is offline, realtime updates paused');
  });
  
  // שמירת הערוץ הפעיל
  activeChannel = channel;
  
  return channel;
};

/**
 * מחדש את החיבור לערוץ התקשורת
 */
export const reconnectRealtimeChannel = () => {
  if (!activeChannel) {
    console.log('No active channel, creating new connection');
    return setupRealtimeConnection();
  }
  
  if (activeChannel.state !== 'joined') {
    console.log('Manually reconnecting realtime channel...');
    activeChannel.subscribe();
  } else {
    console.log('Channel already subscribed, no action needed');
  }
  
  return activeChannel;
};

/**
 * מחזיר את ערוץ התקשורת הפעיל
 */
export const getRealtimeChannel = () => activeChannel;
