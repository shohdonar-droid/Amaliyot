import { firestoreService } from './firestoreService';
import { DailyJournal, PracticeAssignment, Attendance, AuditLog } from '../types';
import { query, where, getDocs, collection, Timestamp, doc, runTransaction, QueryConstraint, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTION = 'dailyJournals';

export const dailyJournalService = {
  getAllJournals: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTION, []) as DailyJournal[];
    const lsData = storageService.getDailyJournals();
    return mergeData(fsData, lsData, 'id');
  },
  getJournalsByStudent: async (studentId: string) => {
    const constraints: QueryConstraint[] = [where('studentId', '==', studentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.studentId === studentId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsByAssignment: async (assignmentId: string) => {
    const constraints: QueryConstraint[] = [where('assignmentId', '==', assignmentId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.assignmentId === assignmentId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsBySupervisor: async (supervisorId: string) => {
    const constraints: QueryConstraint[] = [where('supervisorId', '==', supervisorId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.supervisorId === supervisorId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalsByGroup: async (groupId: string) => {
    const constraints: QueryConstraint[] = [where('groupId', '==', groupId)];
    const fsData = await firestoreService.queryDocuments(COLLECTION, constraints) as DailyJournal[];
    const lsData = storageService.getDailyJournals().filter(j => j.groupId === groupId);
    return mergeData(fsData, lsData, 'id');
  },

  getJournalById: async (journalId: string) => {
    return await firestoreService.getDocumentById(COLLECTION, journalId) as DailyJournal | null;
  },

  createJournal: async (data: Omit<DailyJournal, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await runTransaction(db, async (transaction) => {
      // 1. Assignment Binding & Schedule Validation
      const assignmentRef = doc(db, 'practiceAssignments', data.assignmentId);
      const assignmentSnap = await transaction.get(assignmentRef);
      if (!assignmentSnap.exists()) throw new Error('Amaliyot biriktirilishi topilmadi.');
      const assignment = assignmentSnap.data() as PracticeAssignment;

      // Validate dates
      const journalDate = new Date(data.journalDate);
      if (journalDate < new Date(assignment.startDate) || journalDate > new Date(assignment.endDate)) throw new Error('Sana amaliyot muddatidan tashqarida.');
      const dayName = journalDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (assignment.practiceDays && !assignment.practiceDays.includes(dayName)) throw new Error('Bu kunda amaliyot yo\'q.');

      // 2. Attendance Validation
      const attQ = query(
        collection(db, 'attendance'),
        where('assignmentId', '==', data.assignmentId),
        where('date', '==', data.journalDate),
        where('status', 'in', ['PRESENT', 'LATE', 'EXCUSED'])
      );
      const attSnap = await getDocs(attQ);
      if (attSnap.empty) throw new Error('Tasdiqlangan davomat topilmadi.');

      // 3. Duplicate check
      const q = query(
        collection(db, COLLECTION),
        where('studentId', '==', data.studentId),
        where('assignmentId', '==', data.assignmentId),
        where('journalDate', '==', data.journalDate)
      );
      if (!(await getDocs(q)).empty) throw new Error('Bu sana uchun jurnal allaqachon mavjud.');

      // 4. Create
      const newDocRef = doc(collection(db, COLLECTION));
      transaction.set(newDocRef, {
        ...data,
        status: 'OPEN',
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      await createAuditLog(transaction, data.studentId, 'JOURNAL_CREATED', 'DailyJournal', newDocRef.id);
      return newDocRef.id;
    });
  },

  submitJournal: async (journalId: string, actorUserId: string) => {
    return await runTransaction(db, async (transaction) => {
      const journalRef = doc(db, COLLECTION, journalId);
      const journal = (await transaction.get(journalRef)).data() as DailyJournal;
      
      // Validate 3-day edit window
      const journalDate = new Date(journal.journalDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - journalDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 3) throw new Error('3 kunlik tahrirlash muddati o\'tgan.');

      if (journal.status !== 'OPEN' && journal.status !== 'RETURNED_FOR_EDIT') throw new Error('Bu holatda jurnal yuborib bo\'lmaydi.');
      
      transaction.update(journalRef, { status: 'SUBMITTED_TO_SUPERVISOR', submittedAt: Timestamp.now().toDate().toISOString(), updatedAt: Timestamp.now().toDate().toISOString() });
      await createAuditLog(transaction, actorUserId, 'JOURNAL_SUBMITTED', 'DailyJournal', journalId);
    });
  },

  approveJournal: async (journalId: string, actorUserId: string) => {
    return await runTransaction(db, async (transaction) => {
      const journalRef = doc(db, COLLECTION, journalId);
      const journal = (await transaction.get(journalRef)).data() as DailyJournal;
      
      // Validate 7-day supervisor deadline
      if (journal.submittedAt) {
          const submittedAt = new Date(journal.submittedAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - submittedAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) {
              transaction.update(journalRef, { status: 'CLOSED_BY_3_DAY_TIMEOUT', updatedAt: Timestamp.now().toDate().toISOString() });
              throw new Error('Rahbar tomonidan tasdiqlanmagan (7 kunlik muddat o\'tgan).');
          }
      }

      transaction.update(journalRef, { status: 'APPROVED_BY_SUPERVISOR', reviewedAt: Timestamp.now().toDate().toISOString(), reviewedBy: actorUserId, updatedAt: Timestamp.now().toDate().toISOString() });
      await createAuditLog(transaction, actorUserId, 'JOURNAL_APPROVED', 'DailyJournal', journalId);
    });
  },

  returnJournal: async (journalId: string, actorUserId: string, comment: string) => {
    return await runTransaction(db, async (transaction) => {
      const journalRef = doc(db, COLLECTION, journalId);
      transaction.update(journalRef, { status: 'RETURNED_FOR_EDIT', reviewComment: comment, updatedAt: Timestamp.now().toDate().toISOString() });
      await createAuditLog(transaction, actorUserId, 'JOURNAL_RETURNED', 'DailyJournal', journalId);
    });
  },
  
  reopenJournal: async (journalId: string, actorUserId: string, reason: string, role: string) => {
      return await runTransaction(db, async (transaction) => {
          const journalRef = doc(db, COLLECTION, journalId);
          const status = role === 'SUPER_ADMIN' ? 'REOPENED_BY_SUPER_ADMIN' : 'REOPENED_BY_DEPARTMENT_HEAD';
          transaction.update(journalRef, { status, reopenReason: reason, reopenedBy: actorUserId, reopenedAt: Timestamp.now().toDate().toISOString(), updatedAt: Timestamp.now().toDate().toISOString() });
          await createAuditLog(transaction, actorUserId, 'JOURNAL_REOPENED', 'DailyJournal', journalId);
      });
  },

  closeExpiredJournals: async () => {
    const q = query(collection(db, COLLECTION), where('status', 'in', ['OPEN', 'RETURNED_FOR_EDIT']));
    const snapshot = await getDocs(q);
    const now = new Date();
    
    const batch = [];
    snapshot.forEach(docSnap => {
        const journal = docSnap.data() as DailyJournal;
        const journalDate = new Date(journal.journalDate);
        const diffTime = Math.abs(now.getTime() - journalDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 3) {
            batch.push({ ref: docSnap.ref, data: { status: 'CLOSED_BY_3_DAY_TIMEOUT', updatedAt: Timestamp.now().toDate().toISOString() } });
        }
    });

    for (const item of batch) {
        await firestoreService.updateDocument(COLLECTION, item.ref.id, item.data);
    }
  }
};

async function createAuditLog(transaction: any, actorUserId: string, action: string, entityType: string, entityId: string) {
    const logRef = doc(collection(db, 'auditLogs'));
    transaction.set(logRef, {
        actorUserId,
        action,
        entityType,
        entityId,
        createdAt: Timestamp.now().toDate().toISOString()
    });
}

function mergeData<T extends { id: string }>(fsData: T[], lsData: T[], idField: keyof T): T[] {
    const fsMap = new Map(fsData.map(item => [item[idField], item]));
    lsData.forEach(item => {
        if (!fsMap.has(item[idField])) {
            fsMap.set(item[idField], item);
        }
    });
    return Array.from(fsMap.values());
}
