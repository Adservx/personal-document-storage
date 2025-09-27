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

// Helper function to create authenticated requests
export const createAuthenticatedRequest = async (callback: (client: any) => Promise<any>) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  
  // Create a client with auth headers for this request
  const authenticatedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'securedoc-manager',
        'Authorization': `Bearer ${token}`,
        'X-Firebase-UID': user.uid
      }
    }
  });
  
  return callback(authenticatedClient);
};

// Set auth headers from Firebase
let currentUser: any = null;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  // Note: We'll handle auth headers in individual requests now
  // since direct header manipulation can cause issues
});

export { currentUser };