import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  type Timestamp,
  type Firestore
} from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import type { LeadMagnet, UserProfile } from './types';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'undefined' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'undefined'
);

// Demo mode flag
export const isDemoMode = !isFirebaseConfigured;

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Create auth with proper persistence for Capacitor
const createPersistentAuth = (firebaseApp: FirebaseApp): Auth => {
  if (typeof window === 'undefined') {
    return getAuth(firebaseApp);
  }

  try {
    // Use indexedDB persistence if available, otherwise browserLocalPersistence
    const persistence =
      typeof indexedDB !== 'undefined'
        ? indexedDBLocalPersistence
        : browserLocalPersistence;

    console.log('[Auth] Initializing auth with persistence:', typeof indexedDB !== 'undefined' ? 'indexedDB' : 'localStorage');
    return initializeAuth(firebaseApp, {
      persistence,
    });
  } catch (error) {
    console.warn('[Auth] initializeAuth failed, falling back to getAuth', error);
    return getAuth(firebaseApp);
  }
};

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = createPersistentAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Firebase initialized');
  } catch (error) {
    console.warn('[Firebase] Firebase initialization failed, running in demo mode', error);
  }
} else {
  console.log('[Firebase] Firebase not configured, running in demo mode');
}

export { auth, db };

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    console.log('Demo mode: Simulating Google sign-in');
    throw new Error('Demo mode: Please configure Firebase to enable authentication');
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const hasPlugin = Capacitor.isPluginAvailable('FirebaseAuthentication');

    console.log('[Auth] Google sign-in - isNative:', isNative, 'hasPlugin:', hasPlugin);

    if (isNative && hasPlugin) {
      // Use native Firebase Authentication plugin
      console.log('[Auth] Using native Google sign-in...');
      const result = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
      });

      const idToken = result?.credential?.idToken;
      const accessToken = result?.credential?.accessToken;

      console.log('[Auth] Got tokens - idToken:', !!idToken, 'accessToken:', !!accessToken);

      if (!idToken && !accessToken) {
        throw new Error('Google sign-in failed: no tokens returned');
      }

      // Create credential and sign in with Firebase Web SDK
      console.log('[Auth] Creating Firebase credential...');
      const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);

      console.log('[Auth] Signing in with credential... (auth instance:', !!auth, ')');
      console.log('[Auth] Auth currentUser before signIn:', auth.currentUser?.email || 'none');

      try {
        // Add timeout to detect if signInWithCredential hangs
        const signInPromise = signInWithCredential(auth, credential);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('signInWithCredential timed out after 15s')), 15000)
        );

        const userCredential = await Promise.race([signInPromise, timeoutPromise]);
        console.log('[Auth] Google sign-in successful:', userCredential.user.email);
        console.log('[Auth] User UID:', userCredential.user.uid);
        return userCredential.user;
      } catch (credError: unknown) {
        console.error('[Auth] signInWithCredential failed:', credError);
        console.error('[Auth] Error type:', typeof credError);
        console.error('[Auth] Error name:', credError instanceof Error ? credError.name : 'unknown');
        console.error('[Auth] Error message:', credError instanceof Error ? credError.message : String(credError));
        if (credError && typeof credError === 'object' && 'code' in credError) {
          console.error('[Auth] Error code:', (credError as { code: string }).code);
        }
        throw credError;
      }
    } else {
      // Web fallback - use popup
      console.log('[Auth] Using popup Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[Auth] Google sign-in successful:', result.user.email);
      return result.user;
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async (): Promise<User | null> => {
  if (!auth) {
    console.log('Demo mode: Simulating Apple sign-in');
    throw new Error('Demo mode: Please configure Firebase to enable authentication');
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const hasPlugin = Capacitor.isPluginAvailable('FirebaseAuthentication');

    console.log('[Auth] Apple sign-in - isNative:', isNative, 'hasPlugin:', hasPlugin);

    if (isNative && hasPlugin) {
      // Use native Firebase Authentication plugin
      console.log('[Auth] Using native Apple sign-in...');
      const result = await FirebaseAuthentication.signInWithApple({
        skipNativeAuth: true,
      });

      const idToken = result?.credential?.idToken;
      const rawNonce = result?.credential?.nonce;

      console.log('[Auth] Got Apple token:', !!idToken);

      if (!idToken) {
        throw new Error('Apple sign-in failed: no idToken returned');
      }

      // Create Apple credential with the idToken and nonce
      const credential = appleProvider.credential({
        idToken: idToken,
        rawNonce: rawNonce || undefined,
      });

      const userCredential = await signInWithCredential(auth, credential);
      console.log('[Auth] Apple sign-in successful:', userCredential.user.email);
      return userCredential.user;
    } else {
      // Web fallback - use popup
      console.log('[Auth] Using popup Apple sign-in...');
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      const result = await signInWithPopup(auth, appleProvider);
      console.log('[Auth] Apple sign-in successful:', result.user.email);
      return result.user;
    }
  } catch (error) {
    console.error('Apple sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // In demo mode, immediately call with null
    console.log('[Auth] No auth instance, calling callback with null');
    callback(null);
    return () => { };
  }

  console.log('[Auth] Setting up auth state listener...');
  return onAuthStateChanged(auth, (user) => {
    console.log('[Auth] Auth state changed:', user ? `User: ${user.email}` : 'No user');
    callback(user);
  });
};

// ============================================
// USER PROFILE OPERATIONS
// ============================================

/**
 * Get or create user profile
 */
export const getOrCreateUserProfile = async (user: User): Promise<UserProfile> => {
  if (!db) {
    // Demo mode profile
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      plan: 'free',
      leadMagnetsCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  // Create new profile
  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    plan: 'free',
    leadMagnetsCreated: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, {
    ...newProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newProfile;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update user subscription plan
 */
export const updateUserPlan = async (
  uid: string,
  plan: 'free' | 'pro' | 'unlimited'
): Promise<void> => {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    plan,
    updatedAt: serverTimestamp(),
  });
};

// ============================================
// LEAD MAGNET OPERATIONS
// ============================================

/**
 * Create a new lead magnet
 */
export const createLeadMagnet = async (
  userId: string,
  leadMagnet: Omit<LeadMagnet, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (!db) {
    // Demo mode - return a fake ID
    return `demo-${Date.now()}`;
  }

  const leadMagnetsRef = collection(db, 'leadMagnets');
  const newDocRef = doc(leadMagnetsRef);

  await setDoc(newDocRef, {
    ...leadMagnet,
    id: newDocRef.id,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newDocRef.id;
};

/**
 * Get user's lead magnets
 */
export const getUserLeadMagnets = async (userId: string): Promise<LeadMagnet[]> => {
  if (!db) {
    // Demo mode - return empty array
    return [];
  }

  const leadMagnetsRef = collection(db, 'leadMagnets');
  const q = query(
    leadMagnetsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      generatedAt: (data.generatedAt as Timestamp)?.toDate() || undefined,
    } as LeadMagnet;
  });
};

/**
 * Get a single lead magnet
 */
export const getLeadMagnet = async (id: string): Promise<LeadMagnet | null> => {
  if (!db) return null;

  const docRef = doc(db, 'leadMagnets', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    generatedAt: (data.generatedAt as Timestamp)?.toDate() || undefined,
  } as LeadMagnet;
};

/**
 * Update a lead magnet
 */
export const updateLeadMagnet = async (
  id: string,
  updates: Partial<LeadMagnet>
): Promise<void> => {
  if (!db) return;
  const docRef = doc(db, 'leadMagnets', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a lead magnet
 */
export const deleteLeadMagnet = async (id: string): Promise<void> => {
  if (!db) return;
  const docRef = doc(db, 'leadMagnets', id);
  await deleteDoc(docRef);
};

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Check if user can create more lead magnets and increment count
 */
export const checkAndIncrementUsage = async (
  userId: string,
  maxLeadMagnets: number
): Promise<{ allowed: boolean; remaining: number }> => {
  if (!db) return { allowed: true, remaining: maxLeadMagnets };

  // Unlimited plan
  if (maxLeadMagnets === -1) {
    return { allowed: true, remaining: -1 };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // User doesn't exist in Firestore yet - allow generation with default limits
      return { allowed: true, remaining: maxLeadMagnets };
    }

    const userData = userSnap.data() as UserProfile;
    const currentCount = userData.leadMagnetsCreated || 0;

    // Check if under limit
    if (currentCount < maxLeadMagnets) {
      await updateDoc(userRef, {
        leadMagnetsCreated: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
      return {
        allowed: true,
        remaining: maxLeadMagnets - currentCount - 1
      };
    }

    return { allowed: false, remaining: 0 };
  } catch (error) {
    // If Firestore permissions fail, allow generation anyway
    console.log('checkAndIncrementUsage error (allowing generation):', error);
    return { allowed: true, remaining: maxLeadMagnets };
  }
};