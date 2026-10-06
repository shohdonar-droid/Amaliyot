import { firestoreService } from './firestoreService';
import { Student, User } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';
import { userService } from './userService';

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
    const timestamp = Timestamp.now().toDate().toISOString();
    const studentId = data.studentId || `st-${Date.now()}`;
    const studentLogin = data.login || data.studentCode || 'T00001';

    const studentRecord: Student = {
      ...data,
      id: studentId,
      login: studentLogin,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Create the User first via userService, which uses Firebase Auth
    const userId = await userService.createUser({
        fullName: data.fullName,
        login: studentLogin,
        username: studentLogin,
        password: 'password123',
        role: 'STUDENT',
        email: data.email || `${data.studentCode || studentLogin}@student.uz`,
        phone: data.phone || '',
        status: 'ACTIVE',
        facultyId: data.facultyId,
        studentId: studentId,
        studentCode: data.studentCode,
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const finalStudentRecord = { ...studentRecord, userId };

    // Persist Student to Firestore
    if (db) {
        const newDocRef = doc(collection(db, COLLECTION));
        await setDoc(newDocRef, { ...finalStudentRecord, id: newDocRef.id });
        return newDocRef.id;
    }

    return studentId;
  },

  updateStudent: async (studentId: string, data: Partial<Student>) => {
    const existing = storageService.getStudents().find(s => s.id === studentId);
    if (existing) {
      storageService.saveStudent({ ...existing, ...data });
    }
    if (db) {
      await firestoreService.updateDocument(COLLECTION, studentId, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
    }
  },

  softDeleteStudent: async (studentId: string) => {
    const existing = storageService.getStudents().find(s => s.id === studentId);
    if (existing) {
      storageService.saveStudent({ ...existing, status: 'dismissed' });
    }
    if (db) {
      await firestoreService.updateDocument(COLLECTION, studentId, { status: 'DISMISSED', updatedAt: Timestamp.now().toDate().toISOString() });
    }
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
