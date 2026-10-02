import { firestoreService } from './firestoreService';
import { PracticeDepartment } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'organizationDepartments';

export const organizationDepartmentService = {
  getDepartments: async (organizationId: string) => {
    const constraints: QueryConstraint[] = [where('organizationId', '==', organizationId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as PracticeDepartment[];
    const lsData = storageService.getPracticeDepartments().filter(d => d.organizationId === organizationId);
    return mergeData(fsData, lsData, 'id');
  },

  getDepartment: async (id: string) => {
    return await firestoreService.getDocumentById(COLLECTION, id) as PracticeDepartment | null;
  },

  createDepartment: async (data: Omit<PracticeDepartment, 'id'>) => {
    if (!db) throw new Error('Firestore is not initialized');
    const firestoreDb = db;
    return await runTransaction(firestoreDb, async (transaction) => {
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
  },

  updateDepartment: async (id: string, data: Partial<PracticeDepartment>) => {
    await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  softDeleteDepartment: async (id: string) => {
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
