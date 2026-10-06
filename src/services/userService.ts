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
    try {
      const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as User[];
      if (fsData && fsData.length > 0) {
        fsData.forEach(u => storageService.saveUser(u));
        return fsData;
      }
    } catch (err) {
      console.warn("Firestore getUsers error:", err);
    }
    return storageService.getUsers();
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
    const defaultPassword = data.password || 'password123';
    const email = data.email || `${data.login || 'user'}@system.uz`;

    let uid = data.uid || `uid-${Date.now()}`;

    if (auth) {
      try {
        // 1. Create in Firebase Auth using a secondary Firebase App instance
        // This prevents replacing or logging out the active Admin session on primary auth!
        const secondaryApp = getApps().find(a => a.name === 'userCreationApp') || initializeApp(firebaseConfig, 'userCreationApp');
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, defaultPassword);
        uid = userCredential.user.uid;
        await signOut(secondaryAuth);
      } catch (authErr: any) {
        console.warn("Firebase Auth user creation warning/fallback:", authErr?.message || authErr);
      }
    }

    const id = uid;
    const timestamp = new Date().toISOString();
    const payload: User = {
      ...data,
      id,
      uid,
      email,
      password: defaultPassword,
      status: data.status || 'ACTIVE',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save to Firestore
    if (db) {
      const docRef = doc(db, COLLECTION, id);
      await setDoc(docRef, {
        ...payload,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString()
      });
    }

    // Also sync to storageService for fast in-memory access
    storageService.saveUser(payload);

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


