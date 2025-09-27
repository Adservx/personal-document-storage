import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const result = await AuthService.getCurrentUser();
          if (result.status === 'success') {
            setUser(result.data || null);
          } else {
            setError(result.error || null);
            setUser(null);
          }
        } else {
          setUser(null);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);



  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const result = await AuthService.signInWithGoogle();
    if (result.status === 'error') {
      setError(result.error || 'Google sign in failed');
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await AuthService.signOut();
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
};