import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { onAuthChange, getOrCreateUserProfile, signOut as firebaseSignOut } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Auth] AuthProvider: Setting up auth listener...');

    // Timeout fallback - if auth doesn't respond in 3 seconds, stop loading
    const timeout = setTimeout(() => {
      console.log('[Auth] AuthProvider: Timeout - setting loading to false');
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      clearTimeout(timeout);
      console.log('[Auth] AuthProvider: Auth callback received', firebaseUser?.email || 'no user');
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getOrCreateUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      console.log('[Auth] AuthProvider: Setting loading to false');
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getOrCreateUserProfile(user);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
