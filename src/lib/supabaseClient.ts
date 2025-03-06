import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWxtY3N5ZGthb3MiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MTE4Mzk5MSwiZXhwIjoyMDU2NzU5OTkxfQ.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
