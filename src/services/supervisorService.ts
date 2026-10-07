import { firestoreService } from './firestoreService';
import { Supervisor } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'supervisors';

export const supervisorService = {
  getSupervisors: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as Supervisor[];
    const lsData = storageService.getSupervisors();
    return mergeData(fsData, lsData, 'id');
  },

  getSupervisor: async (id: string) => {
    return await firestoreService.getDocumentById(COLLECTION, id) as Supervisor | null;
  },

  getSupervisorByUserId: async (userId: string) => {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Supervisor[];
    if (fsData.length > 0) return fsData[0];
    const lsData = storageService.getSupervisors().find(s => s.userId === userId);
    return lsData || null;
  },

  createSupervisor: async (data: Omit<Supervisor, 'id'>) => {
    let createdId = `sup-${Date.now()}`;
    if (db) {
      try {
        const firestoreDb = db;
        createdId = await runTransaction(firestoreDb, async (transaction) => {
          const q = query(collection(firestoreDb, COLLECTION), where('userId', '==', data.userId));
          if (!(await getDocs(q)).empty) throw new Error('Bu foydalanuvchi uchun supervisor allaqachon mavjud.');

          const colRef = collection(firestoreDb, COLLECTION);
          const newDocRef = doc(colRef);
          transaction.set(newDocRef, {
            ...data,
            createdAt: Timestamp.now().toDate().toISOString(),
            updatedAt: Timestamp.now().toDate().toISOString(),
            status: 'ACTIVE'
          });
          return newDocRef.id;
        });
      } catch (err) {
        console.warn("Firestore createSupervisor warning/fallback:", err);
      }
    }
    const supObj: Supervisor = {
      ...data,
      id: createdId,
      status: 'ACTIVE'
    };
    storageService.saveSupervisor(supObj);
    return createdId;
  },

  updateSupervisor: async (id: string, data: Partial<Supervisor>) => {
    if (db) {
      await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
    }
    const existing = storageService.getSupervisors().find(s => s.id === id);
    if (existing) {
      storageService.saveSupervisor({ ...existing, ...data });
    }
  },

  softDeleteSupervisor: async (id: string) => {
    if (db) {
      await firestoreService.updateDocument(COLLECTION, id, { status: 'INACTIVE', updatedAt: Timestamp.now().toDate().toISOString() });
    }
    storageService.deleteSupervisor(id);
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
