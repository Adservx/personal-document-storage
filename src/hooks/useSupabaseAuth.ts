import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';

export const useSupabaseAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (authLoading) {
        setIsReady(false);
        return;
      }

      if (user && auth.currentUser) {
        try {
          // Ensure Firebase user is fully loaded and get fresh token
          const token = await auth.currentUser.getIdToken(true);
          setAuthToken(token);
          setIsReady(true);
        } catch (error) {
          console.error('Error setting up Supabase auth:', error);
          setAuthToken(null);
          setIsReady(false);
        }
      } else {
        // Clear auth token when no user
        setAuthToken(null);
        setIsReady(!authLoading); // Ready if not loading and no user
      }
    };

    setupSupabaseAuth();
  }, [user, authLoading]);

  return {
    isReady,
    user,
    loading: authLoading,
    authToken
  };
};
