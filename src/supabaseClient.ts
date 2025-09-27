import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'securedoc-manager'
    }
  }
});

// Set auth headers from Firebase
let currentUser: any = null;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    const token = await user.getIdToken();
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: user.uid,
        email: user.email || '',
        user_metadata: {}
      }
    }).catch(() => {});
  }
});

export { currentUser };