import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase: Connected to real project:', firebaseConfig.projectId, 'Database:', firebaseConfig.firestoreDatabaseId);
} catch (err) {
  console.warn('Firebase initialization error, using local fallback:', err);
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
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
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && !firebaseConfig.apiKey.includes('DemoDummy'));
}

export function getFirebaseConfigStatus(): {
  isConfigured: boolean;
  missingVariables: string[];
  projectIdMasked: string;
  authDomainMasked: string;
  mode: 'LIVE_CLOUD' | 'FALLBACK_EMULATOR_MOCK';
} {
  const isConfigured = isFirebaseCloudConfigured();
  const projectId = firebaseConfig.projectId;
  const authDomain = firebaseConfig.authDomain;

  return {
    isConfigured,
    missingVariables: isConfigured ? [] : ['apiKey'],
    projectIdMasked: projectId ? `${projectId.substring(0, 3)}***${projectId.slice(-3)}` : 'NOT_SET',
    authDomainMasked: authDomain ? `${authDomain.substring(0, 3)}***${authDomain.slice(-5)}` : 'NOT_SET',
    mode: isConfigured ? 'LIVE_CLOUD' : 'FALLBACK_EMULATOR_MOCK'
  };
}

