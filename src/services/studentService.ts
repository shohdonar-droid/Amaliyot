import { firestoreService } from './firestoreService';
import { Student } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'students';

export const studentService = {
  getStudents: async (constraints: QueryConstraint[] = []) => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Student[];
    const lsData = storageService.getStudents();
    return mergeData(fsData, lsData, 'id');
  },

  getStudent: async (studentId: string) => {
    // Note: Firestore stores students by auto-generated ID, but studentId is a business field. 
    // We need to query by studentId (business field) if the ID passed is business ID.
    // Assuming studentId param is the document ID for now.
    return await firestoreService.getDocumentById(COLLECTION, studentId) as Student | null;
  },

  getStudentByUserId: async (userId: string) => {
    const constraints = [where('userId', '==', userId)];
    const results = await firestoreService.queryDocuments(COLLECTION, constraints) as Student[];
    return results.length > 0 ? results[0] : null;
  },

  getStudentsByGroup: async (groupId: string) => {
    const constraints = [where('groupId', '==', groupId)];
    return await studentService.getStudents(constraints);
  },

  getStudentsByAcademicYear: async (academicYearId: string) => {
    const constraints = [where('academicYearId', '==', academicYearId)];
    return await studentService.getStudents(constraints);
  },

  getStudentsByDirection: async (directionId: string) => {
    const constraints = [where('directionId', '==', directionId)];
    return await studentService.getStudents(constraints);
  },

  getStudentsByStatus: async (status: string) => {
    const constraints = [where('status', '==', status)];
    return await studentService.getStudents(constraints);
  },

  createStudent: async (data: Omit<Student, 'id'>) => {
    if (!db) throw new Error('Firestore is not initialized');
    const firestoreDb = db;
    return await runTransaction(firestoreDb, async (transaction) => {
      // Check duplicates
      const studentIdQ = query(collection(firestoreDb, COLLECTION), where('studentId', '==', data.studentId));
      if (!(await getDocs(studentIdQ)).empty) throw new Error('Bu studentId allaqachon mavjud.');
      
      if (data.userId) {
        const userIdQ = query(collection(firestoreDb, COLLECTION), where('userId', '==', data.userId));
        if (!(await getDocs(userIdQ)).empty) throw new Error('Bu userId allaqachon mavjud.');
      }

      if (data.hemisStudentId) {
        const hemisQ = query(collection(firestoreDb, COLLECTION), where('hemisStudentId', '==', data.hemisStudentId));
        if (!(await getDocs(hemisQ)).empty) throw new Error('Bu hemisId allaqachon mavjud.');
      }

      const colRef = collection(firestoreDb, COLLECTION);
      const newDocRef = doc(colRef);
      transaction.set(newDocRef, {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString()
      });
      return newDocRef.id;
    });
  },

  updateStudent: async (studentId: string, data: Partial<Student>) => {
    await firestoreService.updateDocument(COLLECTION, studentId, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  softDeleteStudent: async (studentId: string) => {
    await firestoreService.updateDocument(COLLECTION, studentId, { status: 'DISMISSED', updatedAt: Timestamp.now().toDate().toISOString() });
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
