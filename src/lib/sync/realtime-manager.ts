
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
  
  // פונקציה לרישום לערוץ בעזרת הבטחה
  const subscribeToChannel = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('Subscription timed out');
      }, 10000); // 10-second timeout
      
      try {
        channel.subscribe((status) => {
          clearTimeout(timeout);
          console.log('Supabase channel status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates');
            resolve(status);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to real-time updates');
            reject(status);
          } else if (status === 'TIMED_OUT') {
            console.error('Subscription timed out');
            reject(status);
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error subscribing to channel:', error);
        reject(error);
      }
    });
  };
  
  // רישום ראשוני עם טיפול בשגיאות
  subscribeToChannel().catch(error => {
    console.error('Initial subscription failed:', error);
    
    // Try reconnecting once after a delay
    if (navigator.onLine) {
      console.log('Will attempt to reconnect in 5 seconds...');
      setTimeout(() => {
        if (activeChannel === channel) {  // Only retry if this is still the active channel
          reconnectRealtimeChannel();
        }
      }, 5000);
    }
  });
  
  // הגדרת מאזינים למצב רשת
  window.addEventListener('online', () => {
    console.log('Browser is online again, checking subscription...');
    if (activeChannel === channel && channel.state !== 'joined') {
      reconnectRealtimeChannel();
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
    try {
      // Create a new subscription to replace the old one
      activeChannel.unsubscribe();
      return setupRealtimeConnection();
    } catch (error) {
      console.error('Error during channel reconnection:', error);
      // If reconnection fails, try creating a completely new channel
      return setupRealtimeConnection();
    }
  } else {
    console.log('Channel already subscribed, no action needed');
  }
  
  return activeChannel;
};

/**
 * מחזיר את ערוץ התקשורת הפעיל
 */
export const getRealtimeChannel = () => activeChannel;
