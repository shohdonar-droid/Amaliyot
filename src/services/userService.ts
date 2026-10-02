import { firestoreService } from './firestoreService';
import { User } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

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
    if (!db) {
        // Fallback for demo/offline
        const id = `user-${Date.now()}`;
        storageService.saveUser({ ...data, id } as User);
        return id;
    }
    const firestoreDb = db;
    return await runTransaction(firestoreDb, async (transaction) => {
      // Check duplicate login
      const q = query(collection(firestoreDb, COLLECTION), where('login', '==', data.login));
      const snap = await getDocs(q);
      if (!snap.empty) throw new Error('Bu login allaqachon mavjud.');

      const docRef = data.uid ? doc(firestoreDb, COLLECTION, data.uid) : doc(collection(firestoreDb, COLLECTION));
      const payload = {
        ...data,
        id: docRef.id,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString()
      };
      transaction.set(docRef, payload);
      
      // Also save to storageService for immediate local UI update if needed
      storageService.saveUser(payload as User);
      
      return docRef.id;
    });
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
