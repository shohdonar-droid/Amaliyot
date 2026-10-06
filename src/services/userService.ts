import { firestoreService } from './firestoreService';
import { User } from '../types';
import { collection, Timestamp, doc, query, where, getDocs, QueryConstraint, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { storageService } from './storageService';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const COLLECTION = 'users';

export const userService = {
  getUsers: async (constraints: QueryConstraint[] = []) => {
    return await firestoreService.queryDocuments(COLLECTION, constraints) as User[];
  },

  getUser: async (id: string) => {
    return await firestoreService.getDocumentById(COLLECTION, id) as User | null;
  },

  getUserByUid: async (uid: string) => {
    const constraints = [where('uid', '==', uid)];
    const results = await firestoreService.queryDocuments(COLLECTION, constraints) as User[];
    return results.length > 0 ? results[0] : null;
  },

  createUser: async (data: Omit<User, 'id' | 'uid'> & { uid?: string }) => {
    if (!data.email || !data.password) {
      throw new Error('Authentication configuration error or missing credentials.');
    }

    // 1. Create in Firebase Auth using a secondary Firebase App instance
    // This prevents replacing or logging out the active Admin session on primary auth!
    const secondaryApp = getApps().find(a => a.name === 'userCreationApp') || initializeApp(firebaseConfig, 'userCreationApp');
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
    const uid = userCredential.user.uid;
    await signOut(secondaryAuth);

    const id = uid;
    const timestamp = new Date().toISOString();
    const payload: User = {
      ...data,
      id,
      uid,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Remove password from payload before saving to Firestore
    const { password, ...firestorePayload } = payload;

    // 2. Save to Firestore
    if (db) {
        const docRef = doc(db, COLLECTION, id);
        await setDoc(docRef, {
          ...firestorePayload,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
    }

    return id;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    if (db) {
        await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
    }
    const existing = storageService.getUsers().find(u => u.id === id);
    if (existing) {
        storageService.saveUser({ ...existing, ...data });
    }
  },

  deleteUser: async (id: string) => {
    if (db) {
        await firestoreService.deleteDocument(COLLECTION, id);
    }
    storageService.deleteUser(id);
  }
};


