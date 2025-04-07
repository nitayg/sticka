
/**
 * Realtime Manager
 * מנהל את התקשורת בזמן אמת עם Supabase
 */
import { supabase } from '../supabase/client';
import { StorageEvents } from './constants';

// מעקב אחר מצב החיבור
let connectionAttempts = 0;
let reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
let isConnecting = false;
let realtimeChannel: any = null;
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * יוצר חיבור בזמן אמת לשרת
 */
export const setupRealtimeConnection = () => {
  // מונע חיבורים כפולים
  if (isConnecting) {
    console.log('Connection setup already in progress');
    return null;
  }
  
  // מונע חיבורים רבים מדי
  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log(`Reached max connection attempts (${MAX_RECONNECT_ATTEMPTS}), waiting for manual refresh`);
    return null;
  }

  try {
    console.log('Setting up realtime connection...');
    isConnecting = true;
    connectionAttempts++;
    
    // יצירת ערוץ לקבלת עדכונים בזמן אמת
    realtimeChannel = supabase.channel('public-changes', {
      config: {
        broadcast: { self: false },
        presence: { key: `client-${Math.floor(Math.random() * 1000000)}` },
      },
    });

    // Safety timeout to prevent app from hanging during connection
    const connectionTimeout = setTimeout(() => {
      if (isConnecting) {
        console.log('Connection timeout reached - forcing connection to complete');
        isConnecting = false;
        
        // Dispatch connection error event
        window.dispatchEvent(new CustomEvent(StorageEvents.REALTIME_ERROR, {
          detail: { error: new Error('Connection timeout') }
        }));
      }
    }, 5000);

    // הרשמה לקבלת עדכונים מהשרת
    if (realtimeChannel) {
      // Album changes
      realtimeChannel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'albums',
      }, (payload) => {
        console.log('Realtime album update:', payload.eventType);
        window.dispatchEvent(new CustomEvent(StorageEvents.ALBUMS, { detail: payload }));
      });

      // מאזין לשינויים בתנועות הרשת
      realtimeChannel.on('presence', { event: 'sync' }, () => {
        console.log('Presence state synchronized');
      });

      // מאזין לשגיאות
      realtimeChannel.on('system', { event: '*' }, (payload) => {
        console.log('Realtime system event:', payload);
      });

      // Subscribe to the channel
      realtimeChannel.subscribe((status) => {
        // Clear the safety timeout
        clearTimeout(connectionTimeout);
        isConnecting = false;
        
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates');
          
          // Reset connection attempts on success
          connectionAttempts = 0;
          
          // Dispatch connection event
          window.dispatchEvent(new CustomEvent(StorageEvents.REALTIME_CONNECTED));
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Failed to subscribe to realtime updates');
          
          // Dispatch connection error event
          window.dispatchEvent(new CustomEvent(StorageEvents.REALTIME_ERROR, {
            detail: { status }
          }));
          
          // Schedule reconnection with increasing delay
          if (reconnectionTimer) clearTimeout(reconnectionTimer);
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
          
          reconnectionTimer = setTimeout(() => {
            if (navigator.onLine) {
              console.log(`Attempting to reconnect (attempt ${connectionAttempts + 1})...`);
              setupRealtimeConnection();
            }
          }, delay);
        }
      });
    }
    
    return realtimeChannel;
  } catch (error) {
    console.error('Error setting up realtime connection:', error);
    isConnecting = false;
    
    // Dispatch connection error event
    window.dispatchEvent(new CustomEvent(StorageEvents.REALTIME_ERROR, {
      detail: { error }
    }));
    
    return null;
  }
};

/**
 * מחדש את החיבור לערוץ בזמן אמת
 */
export const reconnectRealtimeChannel = (channel) => {
  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log(`Reached max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}), waiting for manual refresh`);
    return null;
  }
  
  try {
    if (channel) {
      console.log('Reconnecting realtime channel...');
      channel.subscribe();
      return channel;
    } else {
      return setupRealtimeConnection();
    }
  } catch (error) {
    console.error('Error reconnecting realtime channel:', error);
    return null;
  }
};

/**
 * מחזיר את ערוץ התקשורת הנוכחי
 */
export const getRealtimeChannel = () => realtimeChannel;

/**
 * מאפס את מונה נסיונות החיבור
 */
export const resetConnectionAttempts = () => {
  connectionAttempts = 0;
};

// מאזין לשינויים במצב החיבור לאינטרנט
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Device is online, attempting to reconnect...');
    reconnectRealtimeChannel(realtimeChannel);
  });
}
