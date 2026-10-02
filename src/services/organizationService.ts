import { firestoreService } from './firestoreService';
import { PracticePlace } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'organizations';

export const organizationService = {
  getOrganizations: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as PracticePlace[];
    const lsData = storageService.getPracticePlaces();
    return mergeData(fsData, lsData, 'id');
  },

  getOrganization: async (id: string) => {
    return await firestoreService.getDocumentById(COLLECTION, id) as PracticePlace | null;
  },

  createOrganization: async (data: Omit<PracticePlace, 'id'>) => {
    if (!db) throw new Error('Firestore is not initialized');
    const firestoreDb = db;
    return await runTransaction(firestoreDb, async (transaction) => {
      const q = query(collection(firestoreDb, COLLECTION), where('organizationId', '==', data.organizationId));
      if (!(await getDocs(q)).empty) throw new Error('Bu organizationId allaqachon mavjud.');

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

  updateOrganization: async (id: string, data: Partial<PracticePlace>) => {
    await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  softDeleteOrganization: async (id: string) => {
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
