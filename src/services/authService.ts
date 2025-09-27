import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import type { User, ApiResponse } from '../types';

export class AuthService {
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return {
        status: 'success'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to sign out'
      };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        return {
          status: 'success',
          data: null
        };
      }

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        full_name: firebaseUser.displayName || undefined,
        created_at: new Date().toISOString()
      };

      return {
        status: 'success',
        data: user
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get current user'
      };
    }
  }

  static async signInWithGoogle(): Promise<ApiResponse<User>> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        full_name: firebaseUser.displayName || undefined,
        created_at: new Date().toISOString()
      };

      return {
        status: 'success',
        data: user
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to sign in with Google'
      };
    }
  }
}