import { firestoreService } from './firestoreService';
import { Attendance, PracticeAssignment, PracticePlace } from '../types';
import { query, where, getDocs, collection, Timestamp, doc, runTransaction, QueryConstraint, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'attendance';

export const attendanceService = {
  getAllAttendance: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as Attendance[];
    const lsData = storageService.getAttendance();
    return mergeData(fsData, lsData, 'id');
  },
  getAttendance: async (attendanceId: string) => {
    return await firestoreService.getDocumentById(COLLECTION, attendanceId) as Attendance | null;
  },

  getAttendanceByStudent: async (studentId: string) => {
    const constraints: QueryConstraint[] = [where('studentId', '==', studentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Attendance[];
    const lsData = storageService.getAttendance().filter(a => a.studentId === studentId);
    return mergeData(fsData, lsData, 'id');
  },

  getAttendanceByAssignment: async (assignmentId: string) => {
    const constraints: QueryConstraint[] = [where('assignmentId', '==', assignmentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Attendance[];
    const lsData = storageService.getAttendance().filter(a => a.assignmentId === assignmentId);
    return mergeData(fsData, lsData, 'id');
  },

  getAttendanceByDate: async (studentId: string, date: string) => {
    const constraints: QueryConstraint[] = [
        where('studentId', '==', studentId),
        where('date', '==', date)
    ];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Attendance[];
    const lsData = storageService.getAttendance().filter(a => a.studentId === studentId && a.date === date);
    return mergeData(fsData, lsData, 'id');
  },

  getAttendanceByGroup: async (groupId: string) => {
    const constraints: QueryConstraint[] = [where('groupId', '==', groupId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Attendance[];
    const lsData = storageService.getAttendance().filter(a => a.groupId === groupId);
    return mergeData(fsData, lsData, 'id');
  },

  getAttendanceByOrganization: async (organizationId: string) => {
    const constraints: QueryConstraint[] = [where('organizationId', '==', organizationId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as Attendance[];
    const lsData = storageService.getAttendance().filter(a => a.organizationId === organizationId);
    return mergeData(fsData, lsData, 'id');
  },

  createAttendance: async (data: Omit<Attendance, 'id'>, studentLat: number, studentLon: number) => {
    const firestoreDb = db;
    if (!firestoreDb) throw new Error('Firebase ulanmagan');
    return await runTransaction(firestoreDb, async (transaction) => {
      // 1. Validate Assignment
      if (!data.assignmentId) throw new Error('Amaliyot biriktirilishi belgilanmagan.');
      const assignmentRef = doc(firestoreDb, 'practiceAssignments', data.assignmentId);
      const assignmentSnap = await transaction.get(assignmentRef);
      if (!assignmentSnap.exists()) throw new Error('Amaliyot biriktirilishi topilmadi.');
      
      const assignment = assignmentSnap.data() as PracticeAssignment;
      
      // 2. Validate Assignment Context
      if (assignment.studentId !== data.studentId || 
          assignment.practicePlaceId !== data.organizationId ||
          assignment.supervisorId !== data.supervisorId) {
        throw new Error('Amaliyot biriktirilishi ma\'lumotlari mos kelmaydi.');
      }

      // 3. Schedule Validation
      const attendanceDate = new Date(data.date);
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);
      if (attendanceDate < startDate || attendanceDate > endDate) throw new Error('Davomat sana bo\'yicha ruxsat etilmagan.');
      
      const dayName = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (assignment.practiceDays && !assignment.practiceDays.includes(dayName)) throw new Error('Bu kunda amaliyot yo\'q.');

      // 4. Geofence Validation
      const orgRef = doc(firestoreDb, 'organizations', data.organizationId);
      const orgSnap = await transaction.get(orgRef);
      if (!orgSnap.exists()) throw new Error('Tashkilot topilmadi.');
      const org = orgSnap.data() as PracticePlace;

      if (org.latitude && org.longitude && org.allowedRadius) {
        const R = 6371e3; // metres
        const φ1 = studentLat * Math.PI/180;
        const φ2 = org.latitude * Math.PI/180;
        const Δφ = (org.latitude-studentLat) * Math.PI/180;
        const Δλ = (org.longitude-studentLon) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;

        if (d > org.allowedRadius) {
          // Record failed attendance
          const colRef = collection(firestoreDb, COLLECTION);
          const newDocRef = doc(colRef);
          transaction.set(newDocRef, {
            ...data,
            status: 'FAILED',
            failureReason: `Geofence tashqarisida: ${Math.round(d)}m`,
            latitude: studentLat,
            longitude: studentLon,
            createdAt: Timestamp.now().toDate().toISOString(),
            updatedAt: Timestamp.now().toDate().toISOString(),
          });
          return newDocRef.id;
        }
      }

      // 5. Duplicate check
      const q = query(
        collection(firestoreDb, COLLECTION),
        where('studentId', '==', data.studentId),
        where('assignmentId', '==', data.assignmentId),
        where('date', '==', data.date)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) throw new Error('Bu sana uchun davomat allaqachon kiritilgan.');

      // 6. Create Attendance
      const colRef = collection(firestoreDb, COLLECTION);
      const newDocRef = doc(colRef);
      transaction.set(newDocRef, {
        ...data,
        status: 'PRESENT',
        latitude: studentLat,
        longitude: studentLon,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return newDocRef.id;
    });
  },

  updateAttendance: async (id: string, data: Partial<Attendance>) => {
    await firestoreService.updateDocument(COLLECTION, id, { ...data, updatedAt: Timestamp.now().toDate().toISOString() });
  },

  submitAttendanceReason: async (id: string, reason: string, docUrl?: string) => {
    await firestoreService.updateDocument(COLLECTION, id, { 
        excuseReason: reason,
        excuseDocumentUrl: docUrl,
        updatedAt: Timestamp.now().toDate().toISOString()
    });
  },

  approveAttendanceException: async (id: string, approvedBy: string, comment: string) => {
    await firestoreService.updateDocument(COLLECTION, id, { 
        status: 'PRESENT',
        approvalType: 'MANUAL',
        approvedBy,
        approvalComment: comment,
        updatedAt: Timestamp.now().toDate().toISOString()
    });
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
