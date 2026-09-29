import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// In AI Studio or development, env vars or local config can be provided
const envConfig: FirebaseConfigOptions = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForPracticePlatform',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'tma-amaliyot-portal.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'tma-amaliyot-portal',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'tma-amaliyot-portal.appspot.com',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || '(default)'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(envConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase initialized in fallback mode:', err);
}

export { app, auth, db, storage };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or project is not provisioned yet.");
    }
    return false;
  }
}
