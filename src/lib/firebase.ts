import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
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

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, running in demo mode', error);
  }
} else {
  console.log('ℹ️ Firebase not configured, running in demo mode');
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
    // Use redirect on iOS native, popup on web
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, googleProvider);
      return null; // Result handled by redirect
    } else {
      const result = await signInWithPopup(auth, googleProvider);
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
    appleProvider.addScope('email');
    appleProvider.addScope('name');

    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, appleProvider);
      return null;
    } else {
      const result = await signInWithPopup(auth, appleProvider);
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
    callback(null);
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
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
      dailyGenerationsUsed: 0,
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
    dailyGenerationsUsed: 0,
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
  const docRef = doc(db, 'leadMagnets', id);
  await deleteDoc(docRef);
};

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Check and increment daily generation count
 */
export const checkAndIncrementUsage = async (
  userId: string,
  dailyLimit: number
): Promise<{ allowed: boolean; remaining: number }> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { allowed: false, remaining: 0 };
  }

  const userData = userSnap.data() as UserProfile;
  const today = new Date().toISOString().split('T')[0];

  // Reset if new day
  if (userData.lastGenerationDate !== today) {
    await updateDoc(userRef, {
      dailyGenerationsUsed: 1,
      lastGenerationDate: today,
      updatedAt: serverTimestamp(),
    });
    return { allowed: true, remaining: dailyLimit - 1 };
  }

  // Check if under limit
  if (userData.dailyGenerationsUsed < dailyLimit) {
    await updateDoc(userRef, {
      dailyGenerationsUsed: userData.dailyGenerationsUsed + 1,
      updatedAt: serverTimestamp(),
    });
    return {
      allowed: true,
      remaining: dailyLimit - userData.dailyGenerationsUsed - 1
    };
  }

  return { allowed: false, remaining: 0 };
};
