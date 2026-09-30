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
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'probable-wall-007pf.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'probable-wall-007pf',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'probable-wall-007pf.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '615086558119',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:615086558119:web:531fa6b354cfcabdae8482',
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || 'ai-studio-28f73ea3-9fe0-4130-90c7-40ef0040d868'
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
  db = envConfig.firestoreDatabaseId && envConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, envConfig.firestoreDatabaseId)
    : getFirestore(app);
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

export function isFirebaseCloudConfigured(): boolean {
  const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  return Boolean(apiKey && projectId && !apiKey.includes('DemoDummy'));
}

export function getFirebaseConfigStatus(): {
  isConfigured: boolean;
  missingVariables: string[];
  projectIdMasked: string;
  authDomainMasked: string;
  mode: 'LIVE_CLOUD' | 'FALLBACK_EMULATOR_MOCK';
} {
  const missing: string[] = [];
  const metaEnv = (import.meta as any).env || {};
  if (!metaEnv.VITE_FIREBASE_API_KEY || metaEnv.VITE_FIREBASE_API_KEY.includes('DemoDummy')) missing.push('VITE_FIREBASE_API_KEY');
  if (!metaEnv.VITE_FIREBASE_AUTH_DOMAIN) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!metaEnv.VITE_FIREBASE_PROJECT_ID) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!metaEnv.VITE_FIREBASE_STORAGE_BUCKET) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!metaEnv.VITE_FIREBASE_APP_ID) missing.push('VITE_FIREBASE_APP_ID');

  const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID || envConfig.projectId;
  const authDomain = metaEnv.VITE_FIREBASE_AUTH_DOMAIN || envConfig.authDomain;

  return {
    isConfigured: missing.length === 0,
    missingVariables: missing,
    projectIdMasked: projectId ? `${projectId.substring(0, 3)}***${projectId.slice(-3)}` : 'NOT_SET',
    authDomainMasked: authDomain ? `${authDomain.substring(0, 3)}***${authDomain.slice(-5)}` : 'NOT_SET',
    mode: missing.length === 0 ? 'LIVE_CLOUD' : 'FALLBACK_EMULATOR_MOCK'
  };
}

