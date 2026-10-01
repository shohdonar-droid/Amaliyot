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
    return await runTransaction(db, async (transaction) => {
      const q = query(collection(db, COLLECTION), where('organizationId', '==', data.organizationId));
      if (!(await getDocs(q)).empty) throw new Error('Bu organizationId allaqachon mavjud.');

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
