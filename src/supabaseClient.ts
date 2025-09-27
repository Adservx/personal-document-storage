import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env: set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'X-Client-Info': 'securedoc-manager'
    }
  }
});