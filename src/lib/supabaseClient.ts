import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdvhjraiqilmcsydkaos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmhqcmFpcWlsbWNzeWRrYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODM5OTEsImV4cCI6MjA1Njc1OTk5MX0.m3gYUVysgOw97zTVB8TCqPt9Yf0_3lueAssw3B30miA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
