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
    return await runTransaction(db, async (transaction) => {
      const q = query(collection(db, COLLECTION), where('userId', '==', data.userId));
      if (!(await getDocs(q)).empty) throw new Error('Bu foydalanuvchi uchun supervisor allaqachon mavjud.');

      const colRef = collection(db, COLLECTION);
      const newDocRef = doc(colRef);
      transaction.set(newDocRef, {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
        status: 'ACTIVE'
      });
      return newDocRef.id;
    });
  },

  updateSupervisor: async (id: string, data: Partial<Supervisor>) => {
    await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  softDeleteSupervisor: async (id: string) => {
    await firestoreService.updateDocument(COLLECTION, id, { status: 'INACTIVE', updatedAt: Timestamp.now().toDate().toISOString() });
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
