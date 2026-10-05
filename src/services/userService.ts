import { firestoreService } from './firestoreService';
import { User } from '../types';
import { collection, Timestamp, doc, query, where, getDocs, QueryConstraint, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { storageService } from './storageService';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const COLLECTION = 'users';

export const userService = {
  getUsers: async (constraints: QueryConstraint[] = []) => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as User[];
    const lsData = storageService.getUsers();
    return mergeData(fsData, lsData, 'id');
  },

  getUser: async (id: string) => {
    return await firestoreService.getDocumentById(COLLECTION, id) as User | null;
  },

  getUserByUid: async (uid: string) => {
    const constraints = [where('uid', '==', uid)];
    const results = await firestoreService.queryDocuments(COLLECTION, constraints) as User[];
    return results.length > 0 ? results[0] : null;
  },

  createUser: async (data: Omit<User, 'id'>) => {
    let uid = data.uid;
    const email = data.email;
    const password = data.password;

    if (db && auth && email && password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            uid = userCredential.user.uid;
        } catch (err) {
            console.warn('Firebase Auth createUser warning:', err);
        }
    }

    const id = uid || `user-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const payload: User = {
      ...data,
      id,
      uid,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // 1. Save to local storageService immediately
    storageService.saveUser(payload);

    // 2. Save to Firestore users collection
    if (db) {
      try {
        const firestoreDb = db;
        const docRef = doc(firestoreDb, COLLECTION, id);
        await setDoc(docRef, {
          ...payload,
          createdAt: Timestamp.now().toDate().toISOString(),
          updatedAt: Timestamp.now().toDate().toISOString()
        });
      } catch (err) {
        console.warn('Firestore createUser warning (saved in local storage):', err);
      }
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

function mergeData<T extends { id: string }>(fsData: T[], lsData: T[], idField: keyof T): T[] {
    const fsMap = new Map(fsData.map(item => [item[idField], item]));
    lsData.forEach(item => {
        if (!fsMap.has(item[idField])) {
            fsMap.set(item[idField], item);
        }
    });
    return Array.from(fsMap.values());
}
