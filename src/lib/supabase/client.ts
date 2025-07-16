
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create a Supabase client with enhanced realtime configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'sticker-album-app'
    }
  }
});

// Debug Supabase connection issues
supabase.channel('system').on('system', { event: '*' }, (payload) => {
  console.log('Supabase system event:', payload);
}).subscribe((status) => {
  console.log('Supabase system channel status:', status);
});
