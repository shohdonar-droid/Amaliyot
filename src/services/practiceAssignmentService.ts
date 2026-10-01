import { firestoreService } from './firestoreService';
import { PracticeAssignment } from '../types';
import { query, where, getDocs, collection, Timestamp, doc, runTransaction, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'practiceAssignments';

export const practiceAssignmentService = {
  getPracticeAssignments: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as PracticeAssignment[];
    const lsData = storageService.getAssignments();
    return mergeData(fsData, lsData, 'id');
  },

  getPracticeAssignmentsBySupervisor: async (supervisorId: string) => {
    const constraints: QueryConstraint[] = [where('supervisorId', '==', supervisorId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as PracticeAssignment[];
    const lsData = storageService.getAssignments().filter(a => a.supervisorId === supervisorId);
    return mergeData(fsData, lsData, 'id');
  },

  getPracticeAssignmentsByGroup: async (groupId: string) => {
    const constraints: QueryConstraint[] = [where('groupId', '==', groupId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as PracticeAssignment[];
    const lsData = storageService.getAssignments().filter(a => a.groupId === groupId);
    return mergeData(fsData, lsData, 'id');
  },

  getPracticeAssignmentsByOrganization: async (organizationId: string) => {
    const constraints: QueryConstraint[] = [where('practicePlaceId', '==', organizationId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as PracticeAssignment[];
    const lsData = storageService.getAssignments().filter(a => a.practicePlaceId === organizationId);
    return mergeData(fsData, lsData, 'id');
  },

  getPracticeAssignment: async (assignmentId: string) => {
    return await firestoreService.getDocumentById(COLLECTION, assignmentId) as PracticeAssignment | null;
  },

  createPracticeAssignment: async (data: Omit<PracticeAssignment, 'id'>) => {
    return await runTransaction(db, async (transaction) => {
      // Duplicate check: practiceId + groupId + status ACTIVE
      const q = query(
        collection(db, COLLECTION),
        where('practiceId', '==', data.practiceId),
        where('groupId', '==', data.groupId),
        where('status', '==', 'in_progress') // Assuming 'in_progress' is the ACTIVE status
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('Bu guruh uchun ushbu amaliyot bo‘yicha faol taqsimot allaqachon mavjud.');
      }

      const colRef = collection(db, COLLECTION);
      const newDocRef = doc(colRef);
      transaction.set(newDocRef, {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return newDocRef.id;
    });
  },

  updatePracticeAssignment: async (id: string, data: Partial<PracticeAssignment>) => {
    await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  softDeletePracticeAssignment: async (id: string) => {
    await firestoreService.updateDocument(COLLECTION, id, { status: 'failed', updatedAt: Timestamp.now().toDate().toISOString() });
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
