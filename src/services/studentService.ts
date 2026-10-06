import { firestoreService } from './firestoreService';
import { Student, User } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';
import { userService } from './userService';

const COLLECTION = 'students';

export function isStudentActive(student: Partial<Student> | null | undefined): boolean {
  if (!student) return false;
  const s = String(student.status || '').toLowerCase();
  return s !== 'suspended' && s !== 'dismissed' && s !== 'inactive';
}

export const studentService = {
  getStudents: async (constraints: QueryConstraint[] = []) => {
    try {
      const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Student[];
      if (fsData && fsData.length > 0) {
        fsData.forEach(st => storageService.saveStudent(st));
        return fsData;
      }
    } catch (err) {
      console.warn("Firestore getStudents error:", err);
    }
    return storageService.getStudents();
  },

  getStudent: async (studentId: string) => {
    return await firestoreService.getDocumentById(COLLECTION, studentId) as Student | null;
  },

  getStudentByUserId: async (userId: string) => {
    const constraints = [where('userId', '==', userId)];
    const results = await firestoreService.queryDocuments(COLLECTION, constraints) as Student[];
    return results.length > 0 ? results[0] : null;
  },

  getStudentsByGroup: async (groupId: string) => {
    const constraints = [where('groupId', '==', groupId)];
    const allGroupStudents = await studentService.getStudents(constraints);
    // Filter to only active students by default for group operations
    return allGroupStudents.filter(isStudentActive);
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
        status: isStudentActive(data) ? 'ACTIVE' : 'INACTIVE',
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
        storageService.saveStudent({ ...finalStudentRecord, id: newDocRef.id });
        return newDocRef.id;
    }

    storageService.saveStudent(finalStudentRecord);
    return studentId;
  },

  updateStudent: async (studentId: string, data: Partial<Student>) => {
    const existing = storageService.getStudents().find(s => s.id === studentId);
    const updatedStudent = { ...existing, ...data } as Student;
    storageService.saveStudent(updatedStudent);

    if (db) {
      await firestoreService.updateDocument(COLLECTION, studentId, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
    }

    // Sync status to associated User account so blocked students cannot log in
    if (data.status !== undefined) {
      const active = isStudentActive({ status: data.status });
      const targetUserId = updatedStudent.userId || updatedStudent.id;
      if (targetUserId) {
        userService.updateUser(targetUserId, { status: active ? 'ACTIVE' : 'INACTIVE' }).catch(() => {});
      }
    }
  },

  softDeleteStudent: async (studentId: string) => {
    await studentService.updateStudent(studentId, { status: 'dismissed' });
  }
};
