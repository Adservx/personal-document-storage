import React, { createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthContext = useAuth;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const signInWithGoogle = async () => {
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const isNative = Capacitor.isNativePlatform();
      console.log('Platform detected:', isNative ? 'Native (Capacitor)' : 'Web');
      
      // On native platforms (Android/iOS), always use redirect
      // On web, try popup first with fallback to redirect
      if (isNative) {
        console.log('Using redirect authentication for native platform...');
        await signInWithRedirect(auth, provider);
        // Note: signInWithRedirect doesn't return immediately - 
        // the result will be handled by getRedirectResult in useEffect
      } else {
        // Web platform - try popup first, but fallback to redirect if blocked
        try {
          console.log('Attempting popup authentication...');
          const result = await signInWithPopup(auth, provider);
          console.log('Google sign-in successful:', result.user);
          setIsAuthenticating(false);
        } catch (popupError: any) {
          console.log('Popup failed, trying redirect method...', popupError.code);
          
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user') {
            
            // Use redirect method as fallback
            console.log('Using redirect authentication as fallback...');
            await signInWithRedirect(auth, provider);
            // Note: signInWithRedirect doesn't return immediately - 
            // the result will be handled by getRedirectResult in useEffect
            // Keep isAuthenticating true for redirect flow
            
          } else {
            // Re-throw other popup errors
            setIsAuthenticating(false);
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', {
        code: error.code,
        message: error.message,
        details: error
      });
      
      // Handle specific localhost errors
      if (error.code === 'auth/unauthorized-domain') {
        alert('Localhost is not authorized. Please add localhost to Firebase Console > Authentication > Settings > Authorized domains');
      } else if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Redirecting to Google sign-in...');
        // Try redirect as last resort
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error('Redirect also failed:', redirectError);
          alert('Sign-in failed. Please try again or check your browser settings.');
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User cancelled sign-in');
      } else {
        alert(`Sign-in failed: ${error.message}`);
      }
      
      // Don't throw for popup-blocked or user-cancelled - these are handled
      if (error.code !== 'auth/popup-blocked' && error.code !== 'auth/popup-closed-by-user') {
        setIsAuthenticating(false);
        throw error;
      } else {
        setIsAuthenticating(false);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  useEffect(() => {
    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect sign-in successful:', result.user);
          setIsAuthenticating(false);
          // The onAuthStateChanged will handle setting the user
        }
      } catch (error: any) {
        console.error('Redirect sign-in error:', error);
        setIsAuthenticating(false);
        if (error.code !== 'auth/popup-closed-by-user') {
          alert(`Sign-in failed: ${error.message}`);
        }
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user data:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          full_name: firebaseUser.displayName || undefined,
          displayName: firebaseUser.displayName || undefined,
          avatar_url: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          created_at: new Date().toISOString()
        };
        
        console.log('Mapped user data:', user);
        setUser(user);
      } else {
        console.log('No Firebase user found');
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};